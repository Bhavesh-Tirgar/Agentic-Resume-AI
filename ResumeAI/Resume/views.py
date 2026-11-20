from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

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
            text = extract_text_from_pdf(
                resume.resume_file.path
            )

            if not text.strip():
                resume.status = "Failed"
                resume.save()

                return Response(
                    {
                        "message": "No text could be extracted from the uploaded PDF."
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

            return Response(
                {
                    "message": "Resume uploaded successfully.",
                    "resume_id": resume.id,
                    "characters": len(text),
                    "status": resume.status,
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
        resume.delete()
        return Response({"message": "Resume deleted successfully."}, status=status.HTTP_200_OK)
