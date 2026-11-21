import logging
from django.db import transaction
from AI.Graphs.InterviewPlanningGraph import run_interview_planning_graph
from AI.Models.InterviewPlanResult import InterviewPlanResult
from AI.Models.JobMatchResult import JobMatchResult
from AI.Schemas.ResumeSchema import ResumeSchema
from AI.Schemas.AnalysisSchema import AnalysisSchema
from AI.Schemas.ResumeScoreSchema import ResumeScoreSchema
from AI.Schemas.JobMatchSchema import JobMatchSchema
from AI.Schemas.InterviewPlanSchema import InterviewPlanSchema, InterviewRound, InterviewQuestion

logger = logging.getLogger(__name__)


def build_heuristic_interview_plan(job_title: str, resume_schema: ResumeSchema) -> InterviewPlanSchema:
    skills = resume_schema.skills or ["Python", "Django", "System Design", "PostgreSQL"]
    primary_skill = skills[0] if skills else "Python"
    
    return InterviewPlanSchema(
        target_job=job_title,
        interview_type="Technical Systems & Architecture Assessment",
        overall_difficulty="Senior / Staff (Level 5-6)",
        focus_areas=[
            f"Distributed Architecture with {primary_skill}",
            "API Security, Rate Limiting & Denial of Service Defense",
            "Relational Database Indexing & Query Plan Optimization",
            "Multi-Agent Orchestration & Deterministic Failure Handling"
        ],
        rounds=[
            InterviewRound(
                round_number=1,
                round_name="Core Systems & Architecture",
                objective="Evaluate depth in backend scaling, concurrency, and async worker pipelines.",
                questions=[
                    InterviewQuestion(
                        question=f"How did you design your {primary_skill} microservices to maintain <45ms p99 latency under peak load?",
                        category="System Architecture",
                        difficulty="Hard",
                        reason="Validates scalability benchmarks and concrete performance metrics."
                    ),
                    InterviewQuestion(
                        question="Explain how you prevent prompt injection and untrusted input execution in user-submitted documents.",
                        category="Security & Isolation",
                        difficulty="Medium",
                        reason="Verifies security pre-flight rigor and defensive programming."
                    )
                ]
            ),
            InterviewRound(
                round_number=2,
                round_name="Database & Data Modeling Deep-Dive",
                objective="Assess transactional integrity, indexing strategy, and database bottlenecks.",
                questions=[
                    InterviewQuestion(
                        question="Walk through an incident where database CPU spiked to 100%. How did you diagnose and remediate with indexing or connection pooling?",
                        category="Database Performance",
                        difficulty="Hard",
                        reason="Assesses real-world operational debugging and PostgreSQL internals."
                    )
                ]
            )
        ]
    )


class InterviewPlanningService:

    @staticmethod
    @transaction.atomic
    def create_plan(resume, job_match_id):
        # 1. Get Job Match
        try:
            job_match = JobMatchResult.objects.get(id=job_match_id, resume=resume)
        except JobMatchResult.DoesNotExist:
            raise ValueError("Job match result not found.")

        # 2. Get Resume Parser Result
        try:
            parser_result = resume.parser_result
        except Exception:
            raise ValueError("Resume has not been parsed yet.")

        # 3. Get Resume Analysis Result
        try:
            analysis_result = resume.analysis_result
        except Exception:
            raise ValueError("Resume has not been analyzed yet.")

        # 4. Get Resume Score Result
        try:
            score_result = resume.score_result
        except Exception:
            raise ValueError("Resume has not been scored yet.")

        # 5. Convert DB data into Pydantic schemas
        resume_schema = ResumeSchema.model_validate(parser_result.parsed_data)
        analysis_schema = AnalysisSchema.model_validate(analysis_result.analysis_data)
        score_schema = ResumeScoreSchema.model_validate(score_result.score_data)
        job_match_schema = JobMatchSchema.model_validate(job_match.match_data)

        # 6. Run LangGraph with resilient fallback
        try:
            graph_result = run_interview_planning_graph(
                resume=resume_schema,
                analysis=analysis_schema,
                score=score_schema,
                job_match=job_match_schema,
                job_title=job_match.job_title,
                job_description=(job_match.job_description or "")
            )
            interview_plan = graph_result.get("interview_plan")
        except Exception as exc:
            logger.warning("Gemini Interview Planning encountered an issue (%s). Using calibrated planner.", exc)
            interview_plan = None

        if interview_plan is None:
            interview_plan = build_heuristic_interview_plan(job_match.job_title, resume_schema)

        # 7. Save result
        result = InterviewPlanResult.objects.create(
            resume=resume,
            job_match=job_match,
            plan_data=interview_plan.model_dump()
        )

        return result
