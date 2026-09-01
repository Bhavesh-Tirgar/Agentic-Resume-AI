import logging

from django.db import transaction

from AI.Graphs.InterviewPlanningGraph import run_interview_planning_graph

from AI.Models.InterviewPlanResult import InterviewPlanResult

from AI.Models.JobMatchResult import JobMatchResult

from AI.Schemas.ResumeSchema import ResumeSchema
from AI.Schemas.AnalysisSchema import AnalysisSchema
from AI.Schemas.ResumeScoreSchema import ResumeScoreSchema
from AI.Schemas.JobMatchSchema import JobMatchSchema


logger = logging.getLogger(__name__)


class InterviewPlanningService:

    @staticmethod
    @transaction.atomic
    def create_plan(resume, job_match_id):

        # 1. Get Job Match
        try:
            job_match = JobMatchResult.objects.get(id=job_match_id, resume=resume)

        except JobMatchResult.DoesNotExist:

            raise ValueError(
                "Job match result not found."
            )

        # 2. Get Resume Parser Result
        try:
            parser_result = resume.parser_result

        except Exception:

            raise ValueError(
                "Resume has not been parsed yet."
            )

        # 3. Get Resume Analysis Result
        try:
            analysis_result = resume.analysis_result

        except Exception:

            raise ValueError(
                "Resume has not been analyzed yet."
            )

        # 4. Get Resume Score Result
        try:
            score_result = resume.score_result

        except Exception:

            raise ValueError(
                "Resume has not been scored yet."
            )

        # 5. Convert DB data into Pydantic schemas
        resume_schema = ResumeSchema.model_validate(parser_result.parsed_data)

        analysis_schema = AnalysisSchema.model_validate(analysis_result.analysis_data)

        score_schema = ResumeScoreSchema.model_validate(score_result.score_data)

        job_match_schema = JobMatchSchema.model_validate(job_match.match_data)

        # 6. Run LangGraph
        try:
            graph_result = run_interview_planning_graph(

                resume=resume_schema,

                analysis=analysis_schema,

                score=score_schema,

                job_match=job_match_schema,

                job_title=job_match.job_title,

                job_description=(job_match.job_description or "")
            )

        except Exception as exc:

            logger.exception(
                "Interview planning graph failed."
            )

            raise RuntimeError(
                "Interview planning failed."
            ) from exc

        # 7. Get generated plan
        interview_plan = graph_result.get("interview_plan")

        if interview_plan is None:

            raise RuntimeError(
                "Interview planner returned no result."
            )

        # 8. Save result
        result = InterviewPlanResult.objects.create(

            resume=resume,

            job_match=job_match,

            plan_data=interview_plan.model_dump()
        )

        return result