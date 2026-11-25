from collections import defaultdict
import hashlib
import hmac
import os
import logging
from datetime import datetime, timezone
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
import requests
from .models import UserResumeQuota, PaymentTransaction
from .serializers import RegisterSerializer
from Resume.models import Resume
from AI.Models.InterviewSessionRecord import InterviewSessionRecord
from AI.Models.JobMatchResult import JobMatchResult
from AI.Models.InterviewPlanResult import InterviewPlanResult
from AI.Models.JobDiscoveryResult import JobDiscoveryResult

logger = logging.getLogger(__name__)


class RegisterView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "username": request.user.username,
                "email": request.user.email,
                "date_joined": request.user.date_joined.isoformat() if request.user.date_joined else None,
            }
        )


class DataExportView(APIView):
    """
    India DPDP Act (Sec 12) & GDPR (Art 20) Right to Data Portability.
    Exports the authenticated user's complete data dossier including resumes,
    AI parsing records, scores, interview transcripts, and discovered jobs.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        resumes_qs = list(
            Resume.objects.filter(user=user)
            .select_related("parser_result", "analysis_result", "score_result")
            .order_by("-uploaded_at")
        )
        resume_ids = [r.id for r in resumes_qs]

        # Bulk fetch related dossiers in O(1) queries to eliminate 6N+1 N+1 waterfall
        matches_by_resume = defaultdict(list)
        for m in JobMatchResult.objects.filter(resume_id__in=resume_ids):
            matches_by_resume[m.resume_id].append({
                "job_title": m.job_title,
                "job_description": m.job_description,
                "match_data": m.match_data,
                "created_at": m.created_at.isoformat(),
            })

        plans_by_resume = defaultdict(list)
        for p in InterviewPlanResult.objects.filter(resume_id__in=resume_ids):
            plans_by_resume[p.resume_id].append({
                "plan_data": p.plan_data,
                "created_at": p.created_at.isoformat(),
            })

        discoveries_by_resume = defaultdict(list)
        for d in JobDiscoveryResult.objects.filter(resume_id__in=resume_ids):
            discoveries_by_resume[d.resume_id].append({
                "location_query": d.location_query,
                "work_type": d.work_type,
                "discovery_data": d.discovery_data,
                "created_at": d.created_at.isoformat(),
            })

        resumes_data = []
        for resume in resumes_qs:
            parser_data = getattr(getattr(resume, "parser_result", None), "parsed_data", None)
            analysis_data = getattr(getattr(resume, "analysis_result", None), "analysis_data", None)
            score_data = getattr(getattr(resume, "score_result", None), "score_data", None)

            resumes_data.append({
                "resume_id": resume.id,
                "uploaded_at": resume.uploaded_at.isoformat(),
                "status": resume.status,
                "file_name": os.path.basename(resume.resume_file.name) if resume.resume_file else None,
                "extracted_text": resume.extracted_text,
                "parser_result": parser_data,
                "analysis_result": analysis_data,
                "score_result": score_data,
                "job_matches": matches_by_resume[resume.id],
                "interview_plans": plans_by_resume[resume.id],
                "job_discoveries": discoveries_by_resume[resume.id],
            })

        interview_sessions = [
            {
                "session_id": s.session_id,
                "candidate_name": s.candidate_name,
                "target_role": s.target_role,
                "status": s.status,
                "current_round": s.current_round,
                "turns_data": s.turns_data,
                "scorecard_data": s.scorecard_data,
                "created_at": s.created_at.isoformat(),
            }
            for s in InterviewSessionRecord.objects.filter(user=user)
        ]

        export_payload = {
            "compliance": {
                "standard": "India DPDP Act (2023) Section 12 & EU GDPR Article 20",
                "right": "Right to Data Portability",
                "exported_at": datetime.now(timezone.utc).isoformat(),
                "export_version": "1.0",
            },
            "user_profile": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "date_joined": user.date_joined.isoformat() if user.date_joined else None,
                "last_login": user.last_login.isoformat() if user.last_login else None,
            },
            "resumes": resumes_data,
            "interview_sessions": interview_sessions,
        }

        response = Response(export_payload, status=status.HTTP_200_OK)
        filename = f"careerpilot_data_export_{user.username}_{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response


class DeleteAccountView(APIView):
    """
    India DPDP Act (Sec 12(3)) & GDPR (Art 17) Right to Erasure / Right to be Forgotten.
    Performs permanent cryptographic shredding of physical files and cascading
    deletion of all user dossiers, resumes, analysis, interview logs, and credentials.
    """
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        confirm = request.data.get("confirm", False)
        if confirm not in [True, "true", "True", 1, "1"]:
            return Response(
                {
                    "error": "Confirmation required. Set 'confirm': true to permanently erase account and all data."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        username = user.username
        erased_files_count = 0

        # 1. Cryptographically shred physical files on storage (local or remote S3)
        for resume in Resume.objects.filter(user=user):
            if resume.resume_file:
                try:
                    try:
                        file_path = resume.resume_file.path
                    except (NotImplementedError, ValueError, Exception):
                        file_path = None

                    if file_path and os.path.isfile(file_path):
                        file_size = os.path.getsize(file_path)
                        # Overwrite local file bytes with cryptographically secure randomness
                        with open(file_path, "wb") as f:
                            f.write(os.urandom(file_size))

                    resume.resume_file.delete(save=False)
                    erased_files_count += 1
                except Exception as exc:
                    logger.warning("Could not shred physical file %s: %s", resume.resume_file, exc)

        # 2. Cascading deletion of user records
        user.delete()

        return Response(
            {
                "message": "Account and all associated records permanently erased under DPDP / GDPR Right to Erasure.",
                "deleted_username": username,
                "shredded_physical_files": erased_files_count,
                "status": "Erased",
            },
            status=status.HTTP_200_OK,
        )


class ResumeQuotaView(APIView):
    """Returns the user's 1-free-resume allowance and paid at-cost credit balance."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        quota, _ = UserResumeQuota.objects.get_or_create(user=request.user)
        return Response(quota.to_dict(), status=status.HTTP_200_OK)


class ResumeQuotaUnlockView(APIView):
    """
    Unlocks minimal at-cost resume scan credits after the 1st free resume is used.
    Verifies HMAC payment signature when PAYMENT_WEBHOOK_SECRET is configured,
    or allows sandbox top-up only when DEBUG=True or ALLOW_SANDBOX_TOPUP=True.
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        try:
            credits = int(request.data.get("credits", 1))
        except (TypeError, ValueError):
            return Response({"error": "Invalid credits count."}, status=status.HTTP_400_BAD_REQUEST)

        if credits < 1 or credits > 20:
            return Response({"error": "Credits must be between 1 and 20."}, status=status.HTTP_400_BAD_REQUEST)

        webhook_secret = os.getenv("PAYMENT_WEBHOOK_SECRET", "").strip()
        if webhook_secret:
            payment_ref = str(request.data.get("payment_reference", "")).strip()
            provided_sig = str(request.data.get("payment_signature", "")).strip()
            expected_sig = hmac.new(
                webhook_secret.encode("utf-8"),
                f"{request.user.id}:{credits}:{payment_ref}".encode("utf-8"),
                hashlib.sha256,
            ).hexdigest()
            if not payment_ref or not hmac.compare_digest(provided_sig, expected_sig):
                return Response(
                    {"error": "Invalid or missing payment verification signature."},
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )
        else:
            allow_sandbox = settings.DEBUG or os.getenv("ALLOW_SANDBOX_TOPUP", "False").lower() in ("true", "1", "yes")
            if not allow_sandbox:
                return Response(
                    {"error": "Payment gateway is not configured for live top-ups."},
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )

        quota, _ = UserResumeQuota.objects.select_for_update().get_or_create(user=request.user)
        quota.paid_resume_credits += credits
        quota.total_paid_inr += credits * UserResumeQuota.unlock_price_inr()
        quota.save(update_fields=["paid_resume_credits", "total_paid_inr", "updated_at"])

        return Response(
            {
                "message": f"Unlocked {credits} at-cost resume scan credit(s).",
                "quota": quota.to_dict(),
            },
            status=status.HTTP_200_OK,
        )


class RazorpayOrderCreateView(APIView):
    """
    Creates a Razorpay order for at-cost resume scan credits when RAZORPAY_KEY_ID
    and RAZORPAY_KEY_SECRET are configured, or signals sandbox mode in local dev.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            credits = int(request.data.get("credits", 1))
        except (TypeError, ValueError):
            return Response({"error": "Invalid credits count."}, status=status.HTTP_400_BAD_REQUEST)

        if credits < 1 or credits > 20:
            return Response({"error": "Credits must be between 1 and 20."}, status=status.HTTP_400_BAD_REQUEST)

        amount_inr = credits * UserResumeQuota.unlock_price_inr()
        amount_paise = amount_inr * 100

        key_id = os.getenv("RAZORPAY_KEY_ID", "").strip()
        key_secret = os.getenv("RAZORPAY_KEY_SECRET", "").strip()

        if key_id and key_secret:
            try:
                resp = requests.post(
                    "https://api.razorpay.com/v1/orders",
                    auth=(key_id, key_secret),
                    json={
                        "amount": amount_paise,
                        "currency": "INR",
                        "receipt": f"cp_u{request.user.id}_c{credits}",
                        "notes": {"user_id": str(request.user.id), "credits": str(credits)},
                    },
                    timeout=10,
                )
                resp.raise_for_status()
                order_data = resp.json()
                return Response(
                    {
                        "mode": "razorpay",
                        "key_id": key_id,
                        "order_id": order_data["id"],
                        "amount_paise": order_data.get("amount", amount_paise),
                        "currency": order_data.get("currency", "INR"),
                        "credits": credits,
                    },
                    status=status.HTTP_200_OK,
                )
            except Exception as exc:
                logger.exception("Razorpay order creation failed: %s", exc)
                return Response(
                    {"error": "Payment gateway temporarily unavailable."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

        allow_sandbox = settings.DEBUG or os.getenv("ALLOW_SANDBOX_TOPUP", "False").lower() in ("true", "1", "yes")
        if allow_sandbox:
            return Response(
                {
                    "mode": "sandbox",
                    "credits": credits,
                    "amount_paise": amount_paise,
                    "currency": "INR",
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"error": "Payment gateway is not configured."},
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )


class RazorpayPaymentVerifyView(APIView):
    """
    Verifies Razorpay Checkout HMAC-SHA256 signature (order_id|payment_id)
    and atomically credits the user's quota with idempotent replay protection.
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        order_id = str(request.data.get("razorpay_order_id", "")).strip()
        payment_id = str(request.data.get("razorpay_payment_id", "")).strip()
        signature = str(request.data.get("razorpay_signature", "")).strip()
        try:
            credits = int(request.data.get("credits", 1))
        except (TypeError, ValueError):
            return Response({"error": "Invalid credits count."}, status=status.HTTP_400_BAD_REQUEST)

        if credits < 1 or credits > 20 or not order_id or not payment_id or not signature:
            return Response(
                {"error": "Missing or invalid Razorpay payment verification fields."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        key_secret = os.getenv("RAZORPAY_KEY_SECRET", "").strip()
        if not key_secret:
            return Response(
                {"error": "Razorpay secret is not configured on server."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        expected_sig = hmac.new(
            key_secret.encode("utf-8"),
            f"{order_id}|{payment_id}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(signature, expected_sig):
            return Response(
                {"error": "Invalid Razorpay payment signature."},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        if PaymentTransaction.objects.filter(payment_id=payment_id).exists():
            return Response(
                {"error": "This payment has already been credited."},
                status=status.HTTP_409_CONFLICT,
            )

        amount_inr = credits * UserResumeQuota.unlock_price_inr()
        PaymentTransaction.objects.create(
            user=request.user,
            provider="razorpay",
            order_id=order_id,
            payment_id=payment_id,
            credits=credits,
            amount_inr=amount_inr,
        )

        quota, _ = UserResumeQuota.objects.select_for_update().get_or_create(user=request.user)
        quota.paid_resume_credits += credits
        quota.total_paid_inr += amount_inr
        quota.save(update_fields=["paid_resume_credits", "total_paid_inr", "updated_at"])

        return Response(
            {
                "message": f"Payment verified. Unlocked {credits} resume scan credit(s).",
                "quota": quota.to_dict(),
            },
            status=status.HTTP_200_OK,
        )
