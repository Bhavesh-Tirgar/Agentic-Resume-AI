from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APIClient

from Resume.models import Resume
from AI.Models.ResumeParserResult import ResumeParserResult
from AI.Models.ResumeAnalysisResult import ResumeAnalysisResult
from AI.Models.ResumeScoreResult import ResumeScoreResult
from AI.Models.JobMatchResult import JobMatchResult
from AI.Models.InterviewPlanResult import InterviewPlanResult
from AI.Models.JobDiscoveryResult import JobDiscoveryResult

from AI.Schemas.ResumeSchema import ResumeSchema
from AI.Schemas.AnalysisSchema import AnalysisSchema
from AI.Schemas.ResumeScoreSchema import ResumeScoreSchema
from AI.Schemas.JobMatchSchema import JobMatchSchema
from AI.Schemas.InterviewPlanSchema import InterviewPlanSchema
from AI.Schemas.JobDiscoverySchema import JobDiscoveryResponseSchema, DiscoveredJob

from AI.Services.ResumeProcessService import ResumeProcessingService
from AI.Services.JobMatchingService import JobMatchingService
from AI.Services.InterviewPlanningService import InterviewPlanningService
from AI.Services.JobDiscoveryService import JobDiscoveryService


class AITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="aiuser", password="Password123!")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.resume = Resume.objects.create(
            user=self.user,
            status="Completed",
            extracted_text="Bhavesh Tirgar\nSoftware Engineer\nPython, Django, LangGraph, React\n5 years experience"
        )

        # Mock Pydantic models
        self.mock_parsed = ResumeSchema(
            name="Bhavesh Tirgar",
            email="bhavesh@example.com",
            phone="1234567890",
            summary="Experienced Software Engineer",
            skills=["Python", "Django", "React", "LangGraph"]
        )

        self.mock_analysis = AnalysisSchema(
            strengths=["Strong Python background", "Multi-agent expertise"],
            weaknesses=["Needs more cloud metrics"],
            achievements=["Built AI resume analyzer"],
            improvement_areas=["Add Docker/K8s certifications"]
        )

        self.mock_score = ResumeScoreSchema(
            overall=88,
            ats_compatibility=92,
            format=90,
            keywords=85,
            content=86,
            readability=89
        )

    @patch("AI.Services.ResumeProcessService.run_resume_graph")
    def test_resume_processing_service_and_persistence(self, mock_graph):
        """Test ResumeProcessingService runs graph and persists all 3 model results"""
        mock_graph.return_value = {
            "parsed_resume": self.mock_parsed,
            "analysis": self.mock_analysis,
            "score": self.mock_score
        }

        result = ResumeProcessingService.process(self.resume)

        self.assertIsNotNone(result["parser_result"])
        self.assertIsNotNone(result["analysis_result"])
        self.assertIsNotNone(result["score_result"])

        self.assertTrue(ResumeParserResult.objects.filter(resume=self.resume).exists())
        self.assertTrue(ResumeAnalysisResult.objects.filter(resume=self.resume).exists())
        self.assertTrue(ResumeScoreResult.objects.filter(resume=self.resume).exists())

    def test_resume_processing_service_missing_text_raises_error(self):
        """Test ResumeProcessingService fails when extracted text is missing"""
        empty_resume = Resume.objects.create(user=self.user, extracted_text="")
        with self.assertRaises(ValueError):
            ResumeProcessingService.process(empty_resume)

    @patch("AI.Services.JobMatchingService.run_job_matching_graph")
    def test_job_matching_service(self, mock_job_graph):
        """Test JobMatchingService saves match result against parsed resume"""
        ResumeParserResult.objects.create(
            resume=self.resume,
            parsed_data=self.mock_parsed.model_dump()
        )

        mock_job_result = JobMatchSchema(
            overall_match_score=85,
            skill_match_score=88,
            experience_match_score=82,
            education_match_score=90,
            matched_skills=["Python", "Django"],
            missing_skills=["Kubernetes"],
            recommendations=["Add Docker and Kubernetes projects"]
        )
        mock_job_graph.return_value = {
            "match_result": mock_job_result
        }

        result = JobMatchingService.match_resume_to_job(
            resume=self.resume,
            job_title="Senior Python Engineer",
            job_description="Seeking a Python Django expert with Kubernetes"
        )

        self.assertEqual(result.job_title, "Senior Python Engineer")
        self.assertEqual(result.match_data["overall_match_score"], 85)
        self.assertTrue(JobMatchResult.objects.filter(id=result.id).exists())

    @patch("AI.Services.ResumeProcessService.run_resume_graph")
    def test_resume_process_api_view_post_and_get(self, mock_graph):
        """Test POST /api/ai/resume-process/<id>/ and GET /api/ai/resume-process/<id>/"""
        mock_graph.return_value = {
            "parsed_resume": self.mock_parsed,
            "analysis": self.mock_analysis,
            "score": self.mock_score
        }

        url = reverse("resume-process", kwargs={"resume_id": self.resume.id})

        # POST -> process
        post_res = self.client.post(url)
        self.assertEqual(post_res.status_code, status.HTTP_200_OK)
        self.assertIn("score_data", post_res.data)

        # GET -> retrieve
        get_res = self.client.get(url)
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(get_res.data["score_data"])
        self.assertEqual(get_res.data["score_data"]["overall"], 88)

    @patch("AI.Agents.JobDiscoveryAgent.JobDiscoveryAgent.run")
    def test_job_discovery_service_and_api(self, mock_agent_run):
        """Test JobDiscoveryService saves nearby matching roles and API endpoint responds"""
        ResumeParserResult.objects.create(
            resume=self.resume,
            parsed_data=self.mock_parsed.model_dump()
        )
        mock_agent_run.return_value = JobDiscoveryResponseSchema(
            candidate_location="Ahmedabad, India",
            total_jobs_found=1,
            jobs=[
                DiscoveredJob(
                    title="Senior Python Engineer",
                    company="FinTech Core",
                    location="Ahmedabad, India",
                    work_type="Hybrid",
                    distance_commute="3 km away",
                    match_percentage=94,
                    salary_range="₹18L - ₹28L",
                    experience_required="4+ years",
                    matched_skills=["Python", "Django"],
                    missing_skills=[],
                    description_snippet="Build scalable backend systems",
                    apply_url="https://example.com/apply",
                    match_rationale="Great fit"
                )
            ],
            search_summary="1 job found"
        )
        result = JobDiscoveryService.discover_jobs(
            resume=self.resume,
            location="Ahmedabad, India",
            work_type="All"
        )
        self.assertIsNotNone(result)
        self.assertEqual(result.location_query, "Ahmedabad, India")
        self.assertTrue(JobDiscoveryResult.objects.filter(id=result.id).exists())
        self.assertGreater(len(result.discovery_data.get("jobs", [])), 0)

        # Test GET /api/ai/resume/<id>/job-finder/
        url = reverse("job-finder", kwargs={"resume_id": self.resume.id})
        get_res = self.client.get(url)
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.data["discovery_id"], result.id)

        # Test POST /api/ai/resume/<id>/job-finder/
        post_res = self.client.post(url, {"location": "Bengaluru, India", "work_type": "Remote"})
        self.assertEqual(post_res.status_code, status.HTTP_200_OK)
        self.assertEqual(post_res.data["location_query"], "Bengaluru, India")

    @patch("AI.Services.InterviewPlanningService.run_interview_planning_graph")
    def test_interview_planning_service_and_api(self, mock_plan_graph):
        """Test InterviewPlanningService generates and persists interview plan and API handles it"""
        ResumeParserResult.objects.create(
            resume=self.resume,
            parsed_data=self.mock_parsed.model_dump()
        )
        ResumeAnalysisResult.objects.create(
            resume=self.resume,
            analysis_data=self.mock_analysis.model_dump()
        )
        ResumeScoreResult.objects.create(
            resume=self.resume,
            score_data=self.mock_score.model_dump()
        )
        mock_job_match = JobMatchSchema(
            overall_match_score=85,
            skill_match_score=88,
            experience_match_score=82,
            education_match_score=90,
            matched_skills=["Python", "Django"],
            missing_skills=["Kubernetes"],
            recommendations=["Add Docker and Kubernetes projects"]
        )
        match = JobMatchResult.objects.create(
            resume=self.resume,
            job_title="Senior Python Architect",
            job_description="Seeking a Python Django expert",
            match_data=mock_job_match.model_dump()
        )

        mock_plan_graph.return_value = {
            "interview_plan": InterviewPlanSchema(
                target_job="Senior Python Architect",
                interview_type="Technical Systems",
                overall_difficulty="Advanced",
                focus_areas=["Python", "Django Architecture"],
                rounds=[]
            )
        }

        url = reverse("interview-planning", kwargs={"resume_id": self.resume.id, "job_match_id": match.id})
        post_res = self.client.post(url)
        self.assertEqual(post_res.status_code, status.HTTP_200_OK)
        self.assertIn("interview_plan_id", post_res.data)

        plan_id = post_res.data["interview_plan_id"]
        self.assertTrue(InterviewPlanResult.objects.filter(id=plan_id).exists())

        # Test GET interview plan
        get_res = self.client.get(url)
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.data["interview_plan_id"], plan_id)
