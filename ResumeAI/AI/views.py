from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from Resume.models import Resume
from AI.Models.ResumeParserResult import ResumeParserResult
from AI.Models.ResumeAnalysisResult import ResumeAnalysisResult
from AI.Models.ResumeScoreResult import ResumeScoreResult
from AI.Models.JobMatchResult import JobMatchResult
from AI.Models.InterviewPlanResult import InterviewPlanResult

from AI.Services.ResumeProcessService import ResumeProcessingService
from AI.Services.JobMatchingService import JobMatchingService
from AI.Services.InterviewPlanningService import InterviewPlanningService


class ResumeProcessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id):
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)

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

        return Response(
            {
                "resume_id": resume.id,
                "status": resume.status,
                "parsed_data": parser.parsed_data if parser else None,
                "analysis_data": analysis.analysis_data if analysis else None,
                "score_data": score.score_data if score else None,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, resume_id):
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)

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
                "message": "Resume processed successfully.",
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
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
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
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
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
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
        plan = InterviewPlanResult.objects.filter(resume=resume, job_match_id=job_match_id).first()
        if not plan:
            return Response({"error": "Interview plan not found for this match."}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                "interview_plan_id": plan.id,
                "plan_data": plan.plan_data,
                "created_at": plan.created_at,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, resume_id, job_match_id):
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)

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
