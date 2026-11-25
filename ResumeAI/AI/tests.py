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

    def test_tri_tier_interview_session_persistence(self):
        """Test InterviewSessionManager writes to DB and rehydrates after cache clear"""
        from AI.Services.InterviewSessionManager import session_manager, _LOCAL_SESSION_STORE
        from AI.Models.InterviewSessionRecord import InterviewSessionRecord

        session = session_manager.create_session(
            candidate_name="Enterprise Dev",
            target_role="Staff Platform Engineer",
            user_id=self.user.id,
            max_rounds=3
        )
        s_id = session["session_id"]

        # Verify DB entry created
        record = InterviewSessionRecord.objects.filter(session_id=s_id).first()
        self.assertIsNotNone(record)
        self.assertEqual(record.candidate_name, "Enterprise Dev")
        self.assertEqual(record.target_role, "Staff Platform Engineer")

        # Clear memory cache
        _LOCAL_SESSION_STORE.clear()

        # Rehydrate from DB
        rehydrated = session_manager.get_session(s_id)
        self.assertIsNotNone(rehydrated)
        self.assertEqual(rehydrated["candidate_name"], "Enterprise Dev")
        self.assertEqual(rehydrated["target_role"], "Staff Platform Engineer")

    def test_virtual_hr_history_api_view(self):
        """Test GET /api/ai/interview/live/history/ retrieves candidate audit history"""
        from AI.Services.InterviewSessionManager import session_manager

        session_manager.create_session(
            candidate_name="Test Candidate",
            target_role="Lead SRE",
            user_id=self.user.id,
            max_rounds=4
        )

        url = reverse("virtual-hr-history")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("history", res.data)
        self.assertTrue(len(res.data["history"]) >= 1)

    def test_ranked_gaps_aggregation_service_and_api(self):
        """Test CareerPilot ranked gaps aggregation across jobs and interview weaknesses"""
        from AI.Models.InterviewSessionRecord import InterviewSessionRecord
        from AI.Services.RankedGapsService import RankedGapsService

        # Seed discovery result with Docker and Redis gaps
        JobDiscoveryResult.objects.create(
            resume=self.resume,
            location_query="Ahmedabad, India",
            work_type="All",
            discovery_data={
                "jobs": [
                    {
                        "title": "Senior Backend Developer",
                        "company": "Apex Cloud Labs",
                        "missing_skills": ["Docker", "Redis"],
                        "must_haves": ["Docker"],
                    },
                    {
                        "title": "Platform Infrastructure Engineer",
                        "company": "Tech Innovations",
                        "missing_skills": ["Docker", "Kubernetes"],
                        "must_haves": ["Docker"],
                    },
                    {
                        "title": "Database Specialist",
                        "company": "DataScale Ltd",
                        "missing_skills": ["Redis", "AWS"],
                        "must_haves": ["Redis"],
                    }
                ]
            }
        )

        # Seed interview weakness for Docker
        InterviewSessionRecord.objects.create(
            session_id="interview-session-corr-001",
            candidate_name="Alex Pilot",
            target_role="Backend Developer",
            resume_id=self.resume.id,
            user_id=self.user.id,
            scorecard_data={
                "critical_gaps": ["Struggled to articulate container isolation and multi-stage Docker builds."],
                "preparation_recommendations": ["Practice writing production Dockerfiles and docker-compose."]
            }
        )

        # 1. Test direct Service execution
        service_data = RankedGapsService.aggregate_gaps_for_resume(self.resume)
        self.assertIn("total_jobs_analyzed", service_data)
        self.assertGreaterEqual(service_data["total_jobs_analyzed"], 3)
        self.assertGreater(service_data["total_gaps_identified"], 0)

        # Top skill should be Docker (highest job frequency + interview correlation)
        top_skill = service_data["ranked_gaps"][0]
        self.assertEqual(top_skill["skill"], "docker")
        self.assertTrue(top_skill["interview_correlation"])
        self.assertGreaterEqual(top_skill["unlock_percentage"], 60)
        self.assertEqual(top_skill["action_type"], "weekend_project")
        self.assertIn("dockerize", top_skill["action_title"].lower())
        self.assertIn("Marcus 3D interview", service_data["top_unlock_headline"])

        # 2. Test API GET endpoint
        url = reverse("ranked-gaps", kwargs={"resume_id": self.resume.id})
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["top_unlock_skill"], "docker")
        self.assertGreater(len(res.data["ranked_gaps"]), 0)

    def test_virtual_hr_profanity_boundary_and_seniority(self):
        from AI.Services.VirtualHRService import VirtualHRService
        vhr = VirtualHRService()

        # 1. Word with substring like 'predict' (contains 'dick') should NOT trigger profanity
        res_benign = vhr._fallback_turn_evaluation(
            answer="I can predict system load and contradiction in distributed transactions with high precision.",
            current_round=1,
            max_rounds=4
        )
        self.assertNotEqual(res_benign.adaptive_hr_tone, "Firm / Serious")
        self.assertGreater(res_benign.star_score, 20)

        # 2. Actual standalone profanity should trigger firm boundary
        res_profane = vhr._fallback_turn_evaluation(
            answer="This fucking codebase is broken.",
            current_round=1,
            max_rounds=4
        )
        self.assertEqual(res_profane.adaptive_hr_tone, "Firm / Serious")
        self.assertEqual(res_profane.star_score, 5)

        # 3. Brief shrug ("don't know") should be handled as learning opportunity, not code copier
        res_shrug = vhr._fallback_turn_evaluation(
            answer="I don't know.",
            current_round=1,
            max_rounds=4
        )
        self.assertEqual(res_shrug.adaptive_hr_tone, "Encouraging / Socratic")
        self.assertIn("first principles", res_shrug.hr_followup_or_next_question.lower())

    def test_geocommute_international_hubs_and_jitter(self):
        from AI.Utils.GeoCommuteEngine import GeoCommuteEngine
        
        # Geocode international hubs
        tokyo_coords = GeoCommuteEngine.geocode_location("Tokyo, Japan")
        self.assertAlmostEqual(tokyo_coords[0], 35.6762, places=2)
        self.assertAlmostEqual(tokyo_coords[1], 139.6503, places=2)

        zurich_coords = GeoCommuteEngine.geocode_location("Zurich, Switzerland")
        self.assertAlmostEqual(zurich_coords[0], 47.3769, places=2)

        dubai_coords = GeoCommuteEngine.geocode_location("Downtown Dubai, UAE")
        self.assertAlmostEqual(dubai_coords[0], 25.2048, places=2)

        # Distance & commute estimation
        dist = GeoCommuteEngine.haversine_distance_km(12.9716, 77.5946, 12.9352, 77.6245)
        self.assertGreater(dist, 0)
        self.assertLess(dist, 10.0)

        commute = GeoCommuteEngine.estimate_commute(dist)
        self.assertIn("min via Metro", commute["transit"])
        self.assertIn("driving", commute["driving"])

    def test_realvoice_lru_caching(self):
        from AI.Services.RealVoiceService import RealVoiceService, _VOICE_CACHE

        _VOICE_CACHE["en-US-ChristopherNeural:Test phrase 1"] = "data:audio/mp3;base64,mockdata1"
        res = RealVoiceService.synthesize_to_base64("Test phrase 1")
        self.assertEqual(res, "data:audio/mp3;base64,mockdata1")

    def test_whisper_payload_bounds_and_semaphore_timeout(self):
        """Test WhisperAudioService enforces 15MB ceiling and fail-fast semaphore saturation"""
        from AI.Services.WhisperAudioService import WhisperAudioService, _WHISPER_SEMAPHORE

        oversized = b"x" * (WhisperAudioService.MAX_AUDIO_BYTES + 1)
        with self.assertRaises(ValueError):
            WhisperAudioService.transcribe(oversized)

        # Saturate both semaphore slots and verify fail-fast TimeoutError
        orig_timeout = WhisperAudioService.SEMAPHORE_TIMEOUT_SEC
        WhisperAudioService.SEMAPHORE_TIMEOUT_SEC = 0.05
        _WHISPER_SEMAPHORE.acquire()
        _WHISPER_SEMAPHORE.acquire()
        try:
            with self.assertRaises(TimeoutError):
                WhisperAudioService.transcribe(b"small audio bytes")
        finally:
            _WHISPER_SEMAPHORE.release()
            _WHISPER_SEMAPHORE.release()
            WhisperAudioService.SEMAPHORE_TIMEOUT_SEC = orig_timeout

    def test_session_rehydration_question_anonymous_isolation_and_contract(self):
        """Test question rehydration, anonymous history isolation, owner-only session access, and frontend keys"""
        from AI.Services.InterviewSessionManager import session_manager, _LOCAL_SESSION_STORE

        session = session_manager.create_session(
            candidate_name="Alex Isolated",
            target_role="Staff Backend",
            user_id=self.user.id,
            max_rounds=4,
        )
        session["current_question"] = "Walk me through your toughest outage."
        session["turns"] = [
            {"round": 1, "question": "Walk me through your toughest outage.", "answer": "Done", "evaluation": {"star_score": 88}}
        ]
        session["scorecard"] = {
            "verdict": "Hire",
            "overall_score": 89,
            "summary": "Solid architecture clarity.",
            "top_strengths": ["Clear metrics"],
            "critical_gaps": [],
            "preparation_recommendations": ["Keep practicing"],
        }
        session_manager.save_session(session["session_id"], session)

        # 1. Rehydrate question after memory eviction
        _LOCAL_SESSION_STORE.clear()
        rehydrated = session_manager.get_session(session["session_id"])
        self.assertIsNotNone(rehydrated)
        self.assertEqual(rehydrated["current_question"], "Walk me through your toughest outage.")

        # 2. Anonymous history returns [] (zero cross-user leakage)
        self.assertEqual(session_manager.list_candidate_history(user_id=None), [])

        # 3. Authenticated history matches InterviewHistoryView contract
        hist_res = self.client.get(reverse("virtual-hr-history"))
        self.assertEqual(hist_res.status_code, status.HTTP_200_OK)
        self.assertIn("total_records", hist_res.data)
        rec = hist_res.data["history"][0]
        self.assertIn("id", rec)
        self.assertEqual(rec["verdict"], "Hire")
        self.assertEqual(rec["overall_score"], 89)
        self.assertEqual(rec["turns_count"], 1)

        # 4. Another authenticated user cannot access self.user's private interview session
        other_user = User.objects.create_user(username="snooper", password="Password123!")
        other_client = APIClient()
        other_client.force_authenticate(user=other_user)
        snoop_res = other_client.get(reverse("virtual-hr-session", kwargs={"session_id": session["session_id"]}))
        self.assertEqual(snoop_res.status_code, status.HTTP_403_FORBIDDEN)

    def test_virtual_hr_rolling_history_and_scorecard_false_positive_safety(self):
        """Test rolling history compression (>2 rounds) and false-positive safety in scorecard fallback"""
        from AI.Services.VirtualHRService import VirtualHRService

        turns = [
            {
                "round": i,
                "question": f"Q{i}",
                "answer": f"In round {i}, we predict peak database load using zero-copy serialization buffers across distributed microservices, reducing tail p99 latency by forty percent.",
                "evaluation": {"star_score": 85 + i, "critique": f"Solid round {i} breakdown"},
            }
            for i in range(1, 5)
        ]
        summary = VirtualHRService._build_history_summary(turns)
        self.assertIn("Earlier Rounds Digest:", summary)
        self.assertIn("[Round 3]", summary)
        self.assertIn("[Round 4]", summary)
        self.assertNotIn("[Round 1]", summary)

        vhr = VirtualHRService()
        scorecard = vhr._fallback_scorecard({"turns": turns})
        self.assertEqual(scorecard["verdict"], "Hire")
        self.assertEqual(scorecard["overall_score"], 88)

    @patch("AI.Services.JobDiscoveryService.requests.get")
    def test_adzuna_cache_and_daily_quota_guard(self, mock_get):
        """Test Adzuna 6-hour query caching and daily quota ceiling guard"""
        import os
        from datetime import datetime, timezone
        from django.core.cache import cache
        from AI.Services.JobDiscoveryService import fetch_real_jobs_from_adzuna

        cache.clear()
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"results": [{"id": "job-1", "title": "Python Engineer"}]}
        mock_get.return_value.raise_for_status.return_value = None

        with patch.dict(os.environ, {"ADZUNA_APP_ID": "test-id", "ADZUNA_APP_KEY": "test-key", "ADZUNA_DAILY_CAP": "2"}):
            first = fetch_real_jobs_from_adzuna("Backend Engineer", ["Python", "Django"], "Bengaluru")
            second = fetch_real_jobs_from_adzuna("Backend Engineer", ["Python", "Django"], "Bengaluru")
            self.assertEqual(len(first), 1)
            self.assertEqual(len(second), 1)
            self.assertEqual(mock_get.call_count, 1)  # Second served from cache!

            # Exhaust quota and make distinct query -> returns [] without hitting HTTP
            day_key = f"adzuna_daily_quota:{datetime.now(timezone.utc).strftime('%Y-%m-%d')}"
            cache.set(day_key, 2, timeout=3600)
            throttled = fetch_real_jobs_from_adzuna("Staff SRE", ["Go", "Kubernetes"], "London")
            self.assertEqual(throttled, [])
            self.assertEqual(mock_get.call_count, 1)

    def test_vision_telemetry_formdata_json_and_snapshot_cap(self):
        """Test JSON stringified telemetry parsing and oversized snapshot rejection"""
        import json
        from AI.Services.CandidateVisionService import CandidateVisionService

        # FormData sends telemetry as JSON string
        raw_json = json.dumps({
            "camera_active": True,
            "eye_contact_percentage": 91,
            "confidence_score": 88,
            "nervousness_score": 12,
            "gaze_direction": "Direct / Focused",
            "facial_demeanor": "Confident & Composed",
        })
        vis = CandidateVisionService.process_telemetry(client_telemetry=raw_json)
        self.assertEqual(vis.eye_contact_percentage, 91)
        self.assertEqual(vis.confidence_score, 88)

        # Oversized snapshot safely skipped without calling multimodal vision LLM
        oversized_snap = "data:image/jpeg;base64," + ("A" * (CandidateVisionService.MAX_SNAPSHOT_B64_CHARS + 50))
        self.assertIsNone(CandidateVisionService.analyze_snapshot_with_vision(oversized_snap))

    def test_virtual_hr_missing_api_key_graceful_fallback(self):
        """Test VirtualHRService initializes lazily so missing GEMINI_API_KEY triggers fallback instead of 404"""
        import os
        from AI.Services.VirtualHRService import VirtualHRService
        from AI.Services.InterviewSessionManager import session_manager

        with patch.dict(os.environ, {"GEMINI_API_KEY": ""}):
            vhr = VirtualHRService()
            sess = session_manager.create_session(candidate_name="Fallback User", target_role="Backend Engineer", user_id=self.user.id)
            res = vhr.evaluate_turn(sess["session_id"], "I led a PostgreSQL sharding migration reducing p99 latency by 45% across 12 services.")
            self.assertIn("evaluation", res)
            self.assertGreater(res["evaluation"]["star_score"], 50)
            finish_res = vhr.finish_interview(sess["session_id"])
            self.assertIn("scorecard", finish_res)

    def test_recursive_pii_restoration_and_base_agent_inheritance(self):
        """Test recursive PII vault restoration and verify all agents inherit BaseAgent"""
        from AI.Utils.PIIScrubber import PIIScrubber
        from AI.Schemas.UnifiedDossierSchema import UnifiedDossierSchema, ScoreBreakdown, ExperienceItem
        from AI.Agents.BaseAgent import BaseAgent
        from AI.Agents.JobMatchingAgent import JobMatchingAgent
        from AI.Agents.ResumeParserAgent import ResumeParserAgent
        from AI.Agents.JobDiscoveryAgent import JobDiscoveryAgent
        from AI.Agents.InterviewPlannerAgent import InterviewPlannerAgent

        for cls in (JobMatchingAgent, ResumeParserAgent, JobDiscoveryAgent, InterviewPlannerAgent):
            self.assertTrue(issubclass(cls, BaseAgent))

        dossier = UnifiedDossierSchema(
            full_name="Alex Candidate",
            email="[REDACTED_EMAIL_1]",
            phone="[REDACTED_PHONE_1]",
            professional_summary="Reach me at [REDACTED_EMAIL_1].",
            work_experience=[ExperienceItem(role="Engineer", organization="Corp", description="Escalations via [REDACTED_PHONE_1]")],
            score=ScoreBreakdown(overall=85, content=85, format=85, keyword=85, readability=85),
        )
        PIIScrubber.restore_recursive(dossier, {"[REDACTED_EMAIL_1]": "alex@real.io", "[REDACTED_PHONE_1]": "+91-9876543210"})
        self.assertEqual(dossier.email, "alex@real.io")
        self.assertEqual(dossier.professional_summary, "Reach me at alex@real.io.")
        self.assertIn("+91-9876543210", dossier.work_experience[0].description)

    def test_job_matching_graph_enforces_max_70_hard_cap(self):
        """Test LangGraph calibrate_match_node deterministically enforces Max-70 Hard Cap on missing must-haves"""
        from AI.Graphs.JobMatchingGraph import calibrate_match_node
        from AI.Schemas.JobMatchSchema import JobMatchSchema, CompetencyGap

        inflated_llm_output = JobMatchSchema(
            overall_match_score=94,
            skill_match_score=90,
            experience_match_score=85,
            education_match_score=90,
            matched_skills=["Python"],
            missing_skills=["Kubernetes"],
            structured_gaps=[CompetencyGap(skill="Kubernetes", type="must_have", impact="high")],
            why_matches="Good Python.",
            what_blocks="Missing Kubernetes.",
        )
        calibrated = calibrate_match_node({
            "match_result": inflated_llm_output,
            "vector_cosine": 0.48,
            "vector_gaps": ["Kubernetes"],
            "vector_matched": ["Python"],
        })["match_result"]
        self.assertLessEqual(calibrated.overall_match_score, 70)
        self.assertIn("capped at 70", calibrated.what_blocks.lower())

    def test_ranked_gaps_domain_aware_and_no_fake_interview_claims(self):
        """Test non-tech resumes get domain-relevant benchmarks and 0 interviews yields zero interview claims"""
        from AI.Services.RankedGapsService import RankedGapsService

        finance_resume = Resume.objects.create(
            user=self.user,
            status="Completed",
            extracted_text="Certified Public Accountant CPA with 6 years in Corporate Accounting, Statutory Audit, GAAP, and Balance Sheet Governance."
        )
        data = RankedGapsService.aggregate_gaps_for_resume(finance_resume)
        top_skills = [g["skill"] for g in data["ranked_gaps"]]
        self.assertNotIn("docker", top_skills)
        self.assertNotIn("kafka", top_skills)
        self.assertEqual(data["interview_synergy_count"], 0)
        self.assertNotIn("Marcus 3D interview", data["top_unlock_headline"])

    def test_http_get_no_db_mutation_and_404_on_invalid_id(self):
        """Test HTTP GET on missing resume ID returns 404 and never mutates the database"""
        before_count = Resume.objects.count()
        res = self.client.get(reverse("resume-process", kwargs={"resume_id": 99999}))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Resume.objects.count(), before_count)

    def test_virtual_hr_turn_sse_stream_and_nonce_guardrail(self):
        """Test /api/ai/interview/live/turn/stream/ emits SSE transcript & result events and wraps prompts with nonces"""
        import json
        from unittest.mock import MagicMock
        from AI.Services.InterviewSessionManager import session_manager
        from AI.Services.VirtualHRService import VirtualHRService

        sess = session_manager.create_session(candidate_name="Stream User", target_role="Platform Engineer", user_id=self.user.id)
        sess["current_question"] = "Describe a scaling challenge."
        sess["turns"] = [{"round": 1, "question": "Describe a scaling challenge.", "answer": None, "evaluation": None}]
        session_manager.save_session(sess["session_id"], sess)

        # Verify nonce wrapping occurs cleanly on LLM invocation
        vhr = VirtualHRService()
        mock_eval = MagicMock()
        vhr.turn_evaluator = mock_eval
        vhr.scorecard_compiler = MagicMock()
        mock_eval.invoke.side_effect = RuntimeError("mock offline")
        vhr.evaluate_turn(sess["session_id"], "We scaled PostgreSQL read replicas across 3 AZs achieving 99.99% uptime.")
        prompt_sent = mock_eval.invoke.call_args[0][0]
        self.assertIn("<untrusted_candidate_answer_", prompt_sent)
        self.assertIn("<untrusted_candidate_summary_", prompt_sent)

        # Verify SSE streaming endpoint emits stage/transcript & final result
        stream_url = reverse("virtual-hr-turn-stream")
        res = self.client.post(stream_url, {
            "session_id": sess["session_id"],
            "candidate_answer": "We introduced Redis connection pooling and reduced database load by 62%.",
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("text/event-stream", res["Content-Type"])
        body_text = b"".join(res.streaming_content).decode("utf-8")
        self.assertIn("event: transcript", body_text)
        self.assertIn("event: result", body_text)
        # Extract result JSON line
        result_line = [line for line in body_text.splitlines() if line.startswith("data:")][-1]
        payload = json.loads(result_line[5:].strip())
        self.assertEqual(payload["session_id"], sess["session_id"])
        self.assertIn("latency_ms", payload)
        self.assertGreater(payload["evaluation"]["star_score"], 50)
