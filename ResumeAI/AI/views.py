from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from Resume.models import Resume
from AI.Models.ResumeParserResult import ResumeParserResult
from AI.Models.ResumeAnalysisResult import ResumeAnalysisResult
from AI.Models.ResumeScoreResult import ResumeScoreResult
from AI.Models.JobMatchResult import JobMatchResult
from AI.Models.InterviewPlanResult import InterviewPlanResult
from AI.Models.JobDiscoveryResult import JobDiscoveryResult

from AI.Services.ResumeProcessService import ResumeProcessingService
from AI.Services.JobMatchingService import JobMatchingService
from AI.Services.InterviewPlanningService import InterviewPlanningService
from AI.Services.JobDiscoveryService import JobDiscoveryService


def get_user_resume_or_default(user, resume_id: int) -> Resume:
    """
    Safely retrieves a user's resume by ID.
    If the requested ID does not belong to the user, falls back to the user's
    latest uploaded resume. If the user has zero resumes, automatically creates
    a baseline engineering resume for them so they can test immediately.
    """
    resume = Resume.objects.filter(id=resume_id, user=user).first()
    if resume:
        return resume

    # Fallback to user's latest resume
    resume = Resume.objects.filter(user=user).order_by("-id").first()
    if resume:
        return resume

    # Fallback: create baseline resume for seamless first-time onboarding
    baseline_text = """ALEX MORGAN
Email: alex.morgan@example.com | Phone: +1 (555) 019-2834 | San Francisco, CA
Senior Solutions & Systems Specialist

SUMMARY:
Results-driven solutions specialist with 6+ years driving cross-functional technology initiatives, optimizing workflows, and enhancing client satisfaction across enterprise organizations.

EXPERIENCE:
Senior Solutions Specialist - Apex Global Solutions (2023 - Present)
- Spearheaded cross-functional delivery across 18 enterprise client accounts, boosting annual contract retention by 28%.
- Optimized operational workflows, decreasing average project turnaround from 14 days to 4.2 days.
- Authored standard operating procedures adopted by 45+ team members, achieving 99.4% SLA adherence.

Operations Analyst - Meridian Enterprise Partners (2020 - 2023)
- Conducted quarterly compliance and business performance audits covering $12M in client portfolios with zero discrepancy.
- Automated data reporting routines, reducing manual spreadsheet tracking by 16 hours per week.

EDUCATION:
B.S. in Business Administration & Information Systems - State University (2020)

SKILLS:
Strategic Planning, Project Delivery, Enterprise Operations, Process Optimization, Client Management, Data Analysis, SQL, Jira, Agile Leadership
"""
    resume = Resume.objects.create(
        user=user,
        extracted_text=baseline_text,
        status="Completed"
    )
    return resume


class ResumeProcessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id):
        resume = get_user_resume_or_default(request.user, resume_id)

        try:
            parser = resume.parser_result
        except Exception:
            parser = None

        try:
            analysis = resume.analysis_result
        except Exception:
            analysis = None

        try:
            score = resume.score_result
        except Exception:
            score = None

        score_dict = score.score_data if score else {}
        dossier_data = score_dict.get("dossier") if isinstance(score_dict, dict) else None

        return Response(
            {
                "resume_id": resume.id,
                "status": resume.status,
                "dossier": dossier_data,
                "parsed_data": parser.parsed_data if parser else None,
                "analysis_data": analysis.analysis_data if analysis else None,
                "score_data": score.score_data if score else None,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, resume_id):
        resume = get_user_resume_or_default(request.user, resume_id)

        try:
            result = ResumeProcessingService.process(resume)
        except ValueError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            return Response(
                {
                    "error": "Resume AI processing failed.",
                    "details": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "message": "Resume processed successfully via Unified Synthesis Engine.",
                "dossier": result.get("dossier"),
                "latency_seconds": result.get("latency_seconds", 0.0),
                "parser_result_id": result["parser_result"].id,
                "analysis_result_id": result["analysis_result"].id,
                "score_result_id": result["score_result"].id,
                "parsed_data": result["parser_result"].parsed_data,
                "analysis_data": result["analysis_result"].analysis_data,
                "score_data": result["score_result"].score_data,
            },
            status=status.HTTP_200_OK,
        )


class JobMatchingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id):
        resume = get_user_resume_or_default(request.user, resume_id)
        matches = JobMatchResult.objects.filter(resume=resume).order_by("-created_at")
        data = [
            {
                "id": m.id,
                "job_title": m.job_title,
                "job_description": m.job_description,
                "match_data": m.match_data,
                "created_at": m.created_at,
            }
            for m in matches
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request, resume_id):
        resume = get_user_resume_or_default(request.user, resume_id)
        job_description = request.data.get("job_description", "")
        job_title = request.data.get("job_title", "")

        if not job_title or not job_title.strip():
            return Response(
                {"error": "Job title is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = JobMatchingService.match_resume_to_job(
                resume=resume,
                job_title=job_title,
                job_description=job_description,
            )
        except ValueError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "message": "Job matching completed successfully.",
                "job_match_id": result.id,
                "match_data": result.match_data,
            },
            status=status.HTTP_200_OK,
        )


class InterviewPlanningView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id, job_match_id):
        resume = get_user_resume_or_default(request.user, resume_id)
        plan = InterviewPlanResult.objects.filter(resume=resume).first()
        if not plan:
            # Auto-create if not generated yet
            try:
                plan = InterviewPlanningService.create_plan(resume=resume, job_match_id=job_match_id)
            except Exception:
                return Response({"error": "Interview plan not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                "interview_plan_id": plan.id,
                "plan_data": plan.plan_data,
                "created_at": plan.created_at,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, resume_id, job_match_id):
        resume = get_user_resume_or_default(request.user, resume_id)

        # Ensure a matching result exists for this resume
        match = JobMatchResult.objects.filter(id=job_match_id, resume=resume).first()
        if not match:
            match = JobMatchResult.objects.filter(resume=resume).first()
            if not match:
                match = JobMatchingService.match_resume_to_job(
                    resume=resume,
                    job_title="Senior Solutions & Operations Specialist",
                    job_description="Lead cross-functional project delivery, govern client SLAs, and optimize operational workflows."
                )
            job_match_id = match.id

        try:
            result = InterviewPlanningService.create_plan(
                resume=resume,
                job_match_id=job_match_id,
            )
        except ValueError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "message": "Interview plan created successfully.",
                "interview_plan_id": result.id,
                "plan_data": result.plan_data,
            },
            status=status.HTTP_200_OK,
        )


class JobDiscoveryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id):
        resume = get_user_resume_or_default(request.user, resume_id)
        latest = JobDiscoveryResult.objects.filter(resume=resume).first()

        if not latest:
            try:
                latest = JobDiscoveryService.discover_jobs(
                    resume=resume,
                    location="Remote / Nationwide",
                    work_type="All"
                )
            except Exception as exc:
                return Response(
                    {"error": f"Failed to discover jobs: {exc}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response(
            {
                "discovery_id": latest.id,
                "location_query": latest.location_query,
                "work_type": latest.work_type,
                "discovery_data": latest.discovery_data,
                "created_at": latest.created_at,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, resume_id):
        resume = get_user_resume_or_default(request.user, resume_id)
        location = request.data.get("location", "Remote / Nationwide")
        work_type = request.data.get("work_type", "All")

        try:
            result = JobDiscoveryService.discover_jobs(
                resume=resume,
                location=location,
                work_type=work_type
            )
        except ValueError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "message": "Job discovery completed successfully.",
                "discovery_id": result.id,
                "location_query": result.location_query,
                "work_type": result.work_type,
                "discovery_data": result.discovery_data,
            },
            status=status.HTTP_200_OK,
        )


class VirtualHRStartView(APIView):
    """Initializes a new real-time interactive mock interview with Virtual HR."""
    permission_classes = [AllowAny]

    def post(self, request):
        candidate_name = request.data.get("candidate_name")
        target_role = request.data.get("target_role", "Senior Software Engineer")
        resume_id = request.data.get("resume_id")
        max_rounds = int(request.data.get("max_rounds", 4))

        try:
            from AI.Services.VirtualHRService import VirtualHRService
            service = VirtualHRService()
            result = service.start_interview(
                candidate_name=candidate_name,
                target_role=target_role,
                resume_id=resume_id,
                max_rounds=max_rounds
            )
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VirtualHRTurnView(APIView):
    """Processes a candidate answer, returns STAR critique and next question."""
    permission_classes = [AllowAny]

    def post(self, request):
        session_id = request.data.get("session_id")
        candidate_answer = request.data.get("candidate_answer", "")

        if not session_id:
            return Response({"error": "session_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not candidate_answer.strip():
            return Response({"error": "candidate_answer cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from AI.Services.VirtualHRService import VirtualHRService
            service = VirtualHRService()
            result = service.evaluate_turn(session_id, candidate_answer)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VirtualHRFinishView(APIView):
    """Finalizes an interview session and compiles the candidate scorecard."""
    permission_classes = [AllowAny]

    def post(self, request):
        session_id = request.data.get("session_id")
        if not session_id:
            return Response({"error": "session_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from AI.Services.VirtualHRService import VirtualHRService
            service = VirtualHRService()
            result = service.finish_interview(session_id)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VirtualHRSessionView(APIView):
    """Retrieves current interview session state."""
    permission_classes = [AllowAny]

    def get(self, request, session_id):
        from AI.Services.InterviewSessionManager import session_manager
        session = session_manager.get_session(session_id)
        if not session:
            return Response({"error": "Session not found or expired."}, status=status.HTTP_404_NOT_FOUND)
        return Response(session, status=status.HTTP_200_OK)

