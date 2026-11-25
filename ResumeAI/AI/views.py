import json
import time
from django.http import StreamingHttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from Resume.models import Resume
from Authentication.models import UserResumeQuota
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


def require_pro_unlock(request, feature_name: str):
    """Enforces that everything beyond the 1 free resume ATS scan requires a paid unlock."""
    req_user = getattr(request, "user", None)
    if not req_user or not req_user.is_authenticated:
        return Response(
            {
                "code": "PAYWALL_LOCKED",
                "message": (
                    f"Only 1 resume ATS scan is free. Sign in and unlock Pro Pass "
                    f"(₹{UserResumeQuota.unlock_price_inr()} / ${UserResumeQuota.unlock_price_usd():.2f}) "
                    f"to use {feature_name}."
                ),
                "unlock_price_inr": UserResumeQuota.unlock_price_inr(),
                "unlock_price_usd": UserResumeQuota.unlock_price_usd(),
            },
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )
    quota, _ = UserResumeQuota.objects.get_or_create(user=req_user)
    if not quota.is_pro_unlocked:
        return Response(
            {
                "code": "PAYWALL_LOCKED",
                "message": (
                    f"Only 1 resume ATS scan is free. Unlock everything (Job Match, Job Scout, "
                    f"Interview Planner & 3D Mock Interview) for ₹{UserResumeQuota.unlock_price_inr()} / "
                    f"${UserResumeQuota.unlock_price_usd():.2f}."
                ),
                **quota.to_dict(),
            },
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )
    return None


def _is_session_authorized(request, session: dict) -> bool:
    """Allows guest sessions (user_id=None) or restricts user-owned sessions to their owner."""
    owner_id = session.get("user_id")
    if owner_id is None:
        return True
    req_user = getattr(request, "user", None)
    return bool(req_user and req_user.is_authenticated and req_user.id == owner_id)


def resolve_resume_for_read(user, resume_id: int):
    """
    Pure read lookup without side-effect DB mutations on HTTP GET.
    Matches user's exact resume_id, or falls back to their latest resume when default id<=1 is queried.
    """
    resume = Resume.objects.filter(id=resume_id, user=user).first()
    if resume:
        return resume
    if resume_id <= 1:
        return Resume.objects.filter(user=user).order_by("-id").first()
    return None


def get_user_resume_or_default(user, resume_id: int):
    """
    Retrieves a user's resume for mutation/action endpoints (POST).
    Rejects mismatched explicit IDs (>1) with None -> 404, while seamlessly provisioning
    an onboarding baseline only when default ID<=1 is triggered by a brand-new user.
    """
    resume = Resume.objects.filter(id=resume_id, user=user).first()
    if resume:
        return resume

    if resume_id > 1:
        return None

    # Fallback to user's latest resume
    resume = Resume.objects.filter(user=user).order_by("-id").first()
    if resume:
        return resume

    # First-time onboarding baseline on explicit action (POST) when user has 0 resumes
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
    throttle_scope = "ai_heavy"

    def get(self, request, resume_id):
        resume = resolve_resume_for_read(request.user, resume_id)
        if not resume:
            return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)

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
        if not resume:
            return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)

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
    throttle_scope = "ai_heavy"

    def get(self, request, resume_id):
        resume = resolve_resume_for_read(request.user, resume_id)
        if not resume:
            return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
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
        if paywall := require_pro_unlock(request, "Job Matching"):
            return paywall
        resume = get_user_resume_or_default(request.user, resume_id)
        if not resume:
            return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
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
        resume = resolve_resume_for_read(request.user, resume_id)
        if not resume:
            return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)

        plan = InterviewPlanResult.objects.filter(resume=resume, job_match_id=job_match_id).first()
        if not plan and job_match_id <= 1:
            plan = InterviewPlanResult.objects.filter(resume=resume).first()
        if not plan:
            if JobMatchResult.objects.filter(id=job_match_id, resume=resume).exists():
                try:
                    plan = InterviewPlanningService.create_plan(resume=resume, job_match_id=job_match_id)
                except Exception:
                    return Response({"error": "Interview plan not found."}, status=status.HTTP_404_NOT_FOUND)
            else:
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
        if paywall := require_pro_unlock(request, "Interview Planning"):
            return paywall
        resume = get_user_resume_or_default(request.user, resume_id)
        if not resume:
            return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)

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
    throttle_scope = "ai_heavy"

    def get(self, request, resume_id):
        resume = resolve_resume_for_read(request.user, resume_id)
        if not resume:
            return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
        latest = JobDiscoveryResult.objects.filter(resume=resume).first()

        if not latest:
            return Response({"error": "No discovered jobs found yet for this resume."}, status=status.HTTP_404_NOT_FOUND)

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
        if paywall := require_pro_unlock(request, "Job Matching"):
            return paywall
        resume = get_user_resume_or_default(request.user, resume_id)
        if not resume:
            return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
        location = request.data.get("location", "Remote / Nationwide")
        work_type = request.data.get("work_type", "All")
        raw_radius = request.data.get("radius_km") or request.data.get("radius", 25)
        try:
            radius_km = max(1, min(150, int(raw_radius)))
        except (ValueError, TypeError):
            radius_km = 25

        try:
            result = JobDiscoveryService.discover_jobs(
                resume=resume,
                location=location,
                work_type=work_type,
                radius_km=radius_km
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
    throttle_scope = "virtual_hr_turn"

    def post(self, request):
        if paywall := require_pro_unlock(request, "Live Mock Interview"):
            return paywall
        candidate_name = request.data.get("candidate_name")
        target_role = request.data.get("target_role", "Senior Software Engineer")
        resume_id = request.data.get("resume_id")
        try:
            max_rounds = max(1, min(10, int(request.data.get("max_rounds", 4))))
        except (ValueError, TypeError):
            max_rounds = 4
        user_id = request.user.id if request.user and request.user.is_authenticated else None

        try:
            from AI.Services.VirtualHRService import VirtualHRService
            service = VirtualHRService()
            result = service.start_interview(
                candidate_name=candidate_name,
                target_role=target_role,
                resume_id=resume_id,
                user_id=user_id,
                max_rounds=max_rounds
            )
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _parse_and_authorize_turn_request(request):
    """Shared input parsing, FormData JSON normalization, and ownership authorization for turn views."""
    session_id = request.data.get("session_id")
    candidate_answer = request.data.get("candidate_answer", "")
    audio_file = request.FILES.get("audio")
    audio_base64 = request.data.get("audio_base64")
    raw_telemetry = request.data.get("vision_telemetry")
    snapshot_base64 = request.data.get("snapshot_base64")

    if not session_id:
        return None, Response({"error": "session_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(raw_telemetry, str):
        try:
            vision_telemetry = json.loads(raw_telemetry)
        except Exception:
            vision_telemetry = {}
    else:
        vision_telemetry = raw_telemetry

    if not audio_file and not audio_base64 and not str(candidate_answer).strip():
        return None, Response({"error": "Audio recording or text answer is required."}, status=status.HTTP_400_BAD_REQUEST)

    from AI.Services.InterviewSessionManager import session_manager
    existing = session_manager.get_session(session_id)
    if existing and not _is_session_authorized(request, existing):
        return None, Response({"error": "Not authorized to access this interview session."}, status=status.HTTP_403_FORBIDDEN)

    return {
        "session_id": session_id,
        "candidate_answer": candidate_answer,
        "audio_file": audio_file,
        "audio_base64": audio_base64,
        "vision_telemetry": vision_telemetry,
        "snapshot_base64": snapshot_base64,
    }, None


class VirtualHRTurnView(APIView):
    """Processes a candidate answer via Whisper audio transcription or direct text, returning STAR critique and next question."""
    permission_classes = [AllowAny]
    throttle_scope = "virtual_hr_turn"

    def post(self, request):
        if paywall := require_pro_unlock(request, "Live Mock Interview"):
            return paywall
        t0 = time.perf_counter()
        parsed, error_resp = _parse_and_authorize_turn_request(request)
        if error_resp is not None:
            return error_resp

        try:
            from AI.Services.InterviewAgent import InterviewAgent
            agent = InterviewAgent()
            result = agent.process_turn(
                session_id=parsed["session_id"],
                audio_file=parsed["audio_file"],
                audio_base64=parsed["audio_base64"],
                text_answer=parsed["candidate_answer"],
                client_telemetry=parsed["vision_telemetry"],
                snapshot_base64=parsed["snapshot_base64"],
            )
            result["latency_ms"] = int((time.perf_counter() - t0) * 1000)
            return Response(result, status=status.HTTP_200_OK)
        except TimeoutError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except ValueError as exc:
            err_msg = str(exc)
            code = status.HTTP_404_NOT_FOUND if "not found" in err_msg.lower() else status.HTTP_400_BAD_REQUEST
            return Response({"error": err_msg}, status=code)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VirtualHRTurnStreamView(APIView):
    """
    Server-Sent Events (SSE) endpoint streaming real-time Whisper transcription
    before STAR evaluation & neural TTS complete, cutting perceived wait latency.
    """
    permission_classes = [AllowAny]
    throttle_scope = "virtual_hr_turn"

    @staticmethod
    def _format_sse(event: str, payload: dict) -> str:
        return f"event: {event}\ndata: {json.dumps(payload)}\n\n"

    def post(self, request):
        if paywall := require_pro_unlock(request, "Live Mock Interview"):
            return paywall
        t0 = time.perf_counter()
        parsed, error_resp = _parse_and_authorize_turn_request(request)
        if error_resp is not None:
            return error_resp

        def event_stream():
            from AI.Services.InterviewAgent import InterviewAgent
            from AI.Services.VirtualHRService import VirtualHRService

            try:
                if parsed["audio_file"] or parsed["audio_base64"]:
                    yield self._format_sse("stage", {"stage": "transcribing", "message": "Transcribing audio with Whisper..."})

                resolved_answer, used_whisper = InterviewAgent.resolve_answer(
                    audio_file=parsed["audio_file"],
                    audio_base64=parsed["audio_base64"],
                    text_answer=parsed["candidate_answer"],
                )

                yield self._format_sse("transcript", {
                    "stage": "evaluating",
                    "transcribed_text": resolved_answer,
                    "used_whisper": used_whisper,
                    "message": "Evaluating STAR technical depth...",
                })

                service = VirtualHRService()
                result = service.evaluate_turn(
                    session_id=parsed["session_id"],
                    candidate_answer=resolved_answer,
                    client_telemetry=parsed["vision_telemetry"],
                    snapshot_base64=parsed["snapshot_base64"],
                )
                result["transcribed_text"] = resolved_answer
                result["used_whisper"] = used_whisper
                result["latency_ms"] = int((time.perf_counter() - t0) * 1000)

                yield self._format_sse("result", result)
            except Exception as exc:
                yield self._format_sse("error", {"error": str(exc)})

        resp = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
        resp["Cache-Control"] = "no-cache"
        resp["X-Accel-Buffering"] = "no"
        return resp


class WhisperTranscribeView(APIView):
    """Direct Whisper audio speech-to-text endpoint with payload and concurrency guards."""
    permission_classes = [AllowAny]
    throttle_scope = "whisper_stt"

    def post(self, request):
        if paywall := require_pro_unlock(request, "Whisper Speech-to-Text"):
            return paywall
        audio_file = request.FILES.get("audio")
        audio_base64 = request.data.get("audio_base64")

        if not audio_file and not audio_base64:
            return Response({"error": "Audio file or audio_base64 is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from AI.Services.WhisperAudioService import WhisperAudioService
            if audio_file:
                text = WhisperAudioService.transcribe(audio_file)
            else:
                text = WhisperAudioService.transcribe_base64(audio_base64)
            return Response(
                {
                    "transcription": text,
                    "transcribed_text": text,
                    "model": "faster-whisper-base.en",
                },
                status=status.HTTP_200_OK,
            )
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except TimeoutError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VirtualHRFinishView(APIView):
    """Finalizes an interview session and compiles the candidate scorecard."""
    permission_classes = [AllowAny]

    def post(self, request):
        if paywall := require_pro_unlock(request, "Live Mock Interview"):
            return paywall
        session_id = request.data.get("session_id")
        if not session_id:
            return Response({"error": "session_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        from AI.Services.InterviewSessionManager import session_manager
        existing = session_manager.get_session(session_id)
        if existing and not _is_session_authorized(request, existing):
            return Response({"error": "Not authorized to finish this interview session."}, status=status.HTTP_403_FORBIDDEN)

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
        if not _is_session_authorized(request, session):
            return Response({"error": "Not authorized to view this interview session."}, status=status.HTTP_403_FORBIDDEN)
        return Response(session, status=status.HTTP_200_OK)


class VirtualHRHistoryView(APIView):
    """Retrieves candidate past mock interview audit sessions and scorecards."""
    permission_classes = [AllowAny]

    def get(self, request):
        from AI.Services.InterviewSessionManager import session_manager
        user_id = request.user.id if request.user and request.user.is_authenticated else None
        try:
            limit = max(1, min(50, int(request.query_params.get("limit", 10))))
        except (ValueError, TypeError):
            limit = 10
        history = session_manager.list_candidate_history(user_id=user_id, limit=limit)
        return Response({"total_records": len(history), "history": history}, status=status.HTTP_200_OK)


class RankedGapsView(APIView):
    """
    CareerPilot Ranked Gaps Aggregation View.
    Aggregates skill gaps across discovered and saved jobs, calculates unlock rates,
    cross-references Marcus 3D interview weaknesses, and generates high-ROI bridge projects.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id):
        resume = resolve_resume_for_read(request.user, resume_id)
        if not resume:
            return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
        from AI.Services.RankedGapsService import RankedGapsService
        data = RankedGapsService.aggregate_gaps_for_resume(resume)
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request, resume_id):
        if paywall := require_pro_unlock(request, "Job Matching"):
            return paywall
        resume = get_user_resume_or_default(request.user, resume_id)
        if not resume:
            return Response({"error": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
        candidate_jobs = request.data.get("jobs", None)
        from AI.Services.RankedGapsService import RankedGapsService
        data = RankedGapsService.aggregate_gaps_for_resume(resume, candidate_jobs=candidate_jobs)
        return Response(data, status=status.HTTP_200_OK)
