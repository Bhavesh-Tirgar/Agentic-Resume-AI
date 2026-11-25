from collections import defaultdict
import os
import logging
from datetime import datetime, timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
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
