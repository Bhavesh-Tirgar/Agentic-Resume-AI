from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404

from Authentication.models import UserResumeQuota
from .models import Resume
from .serializers import ResumeUploadSerializer
from .Utils.pdfExtractor import extract_text_from_pdf


class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        resumes = Resume.objects.filter(user=request.user).order_by("-uploaded_at")
        data = [
            {
                "id": r.id,
                "file_name": r.resume_file.name.split("/")[-1] if r.resume_file else "",
                "file_url": r.resume_file.url if r.resume_file else None,
                "status": r.status,
                "uploaded_at": r.uploaded_at,
                "has_extracted_text": bool(r.extracted_text),
                "characters": len(r.extracted_text) if r.extracted_text else 0,
            }
            for r in resumes
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        quota, _ = UserResumeQuota.objects.get_or_create(user=request.user)
        if not quota.can_upload():
            return Response(
                {
                    "code": "QUOTA_EXCEEDED",
                    "message": (
                        f"Your {UserResumeQuota.free_limit()} free resume scan has been used. "
                        f"Unlock an additional scan at cost (₹{UserResumeQuota.unlock_price_inr()} / "
                        f"${UserResumeQuota.unlock_price_usd():.2f}) to cover AI & OCR compute."
                    ),
                    **quota.to_dict(),
                },
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        serializer = ResumeUploadSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        resume = serializer.save(
            user=request.user,
            status="Processing",
        )

        try:
            with resume.resume_file.open("rb") as f:
                file_bytes = f.read()
            text = extract_text_from_pdf(
                file_bytes,
                filename=resume.resume_file.name,
            )

            if not text.strip():
                resume.status = "Failed"
                resume.save()

                return Response(
                    {
                        "message": "No text could be extracted from the uploaded document (PDF or DOCX)."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Remove NUL characters from extracted PDF/OCR text
            text = text.replace("\x00", "")

            # Normalize line endings
            text = text.replace("\r\n", "\n").replace("\r", "\n")

            resume.extracted_text = text
            resume.status = "Completed"
            resume.save()

            with transaction.atomic():
                locked_quota, _ = UserResumeQuota.objects.select_for_update().get_or_create(user=request.user)
                if locked_quota.free_resumes_used < UserResumeQuota.free_limit():
                    locked_quota.free_resumes_used += 1
                    locked_quota.save(update_fields=["free_resumes_used", "updated_at"])
                elif locked_quota.paid_resume_credits > 0:
                    locked_quota.paid_resume_credits -= 1
                    locked_quota.save(update_fields=["paid_resume_credits", "updated_at"])

            return Response(
                {
                    "message": "Resume uploaded successfully.",
                    "resume_id": resume.id,
                    "characters": len(text),
                    "status": resume.status,
                    "quota": locked_quota.to_dict(),
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            resume.status = "Failed"
            resume.save()

            return Response(
                {
                    "message": "Failed to process resume.",
                    "error": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ResumeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id):
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
        return Response(
            {
                "id": resume.id,
                "file_name": resume.resume_file.name.split("/")[-1] if resume.resume_file else "",
                "file_url": resume.resume_file.url if resume.resume_file else None,
                "status": resume.status,
                "uploaded_at": resume.uploaded_at,
                "extracted_text": resume.extracted_text,
                "characters": len(resume.extracted_text) if resume.extracted_text else 0,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, resume_id):
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
        if resume.resume_file:
            try:
                resume.resume_file.delete(save=False)
            except Exception:
                pass
        resume.delete()
        return Response({"message": "Resume deleted successfully."}, status=status.HTTP_200_OK)
