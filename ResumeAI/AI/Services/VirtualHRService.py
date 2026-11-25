import re
import logging
import time
from typing import Any, Dict, List, Optional

from AI.Services.GeminiService import GeminiService
from AI.Services.InterviewSessionManager import session_manager
from AI.Services.CandidateVisionService import CandidateVisionService
from AI.Schemas.VirtualHRSchema import (
    InterviewTurnEvaluation,
    InterviewFinalScorecard,
    VisionTelemetry,
)
from AI.Prompts.VirtualHRPrompt import VIRTUAL_HR_EVALUATION_PROMPT, VIRTUAL_HR_SCORECARD_PROMPT
from Resume.models import Resume

logger = logging.getLogger(__name__)


class VirtualHRService:
    """
    Virtual HR Real-Time Mock Interview & Candidate Evaluation Engine.
    Executes turn-by-turn STAR behavioral and technical evaluations,
    adaptive follow-up probing, and executive hiring scorecards.
    """

    # Inflection-aware regexes prevent false positives on benign words (e.g. 'predict' containing 'dick')
    PROFANITY_PATTERNS = [
        r'\bfuck[a-z]*\b',
        r'\bshit[a-z]*\b',
        r'\bbitch[a-z]*\b',
        r'\basshole[a-z]*\b',
        r'\bdick[s]?\b',
        r'\bdamn[a-z]*\b',
        r'\bcunt[s]?\b',
        r'f\*\*k',
    ]

    COPIED_PHRASES = [
        "just copy",
        "i copy",
        "copied from stack",
        "copy pasted",
        "didn't make it",
        "didnt make it",
    ]

    SHRUG_PHRASES = ["don't know", "dont know", "no idea", "dunno", "not sure"]

    def __init__(self):
        self.gemini_service = None
        self.llm = None
        self.turn_evaluator = None
        self.scorecard_compiler = None

    def _ensure_llm(self):
        """Lazily binds Gemini LLM clients inside protected fallback blocks so missing API keys trigger graceful fallbacks."""
        if self.turn_evaluator is None or self.scorecard_compiler is None:
            self.gemini_service = GeminiService()
            self.llm = self.gemini_service.get_llm()
            self.turn_evaluator = self.llm.with_structured_output(InterviewTurnEvaluation)
            self.scorecard_compiler = self.llm.with_structured_output(InterviewFinalScorecard)

    @classmethod
    def _has_profanity(cls, text: str) -> bool:
        lower = (text or "").lower()
        return any(re.search(pat, lower) for pat in cls.PROFANITY_PATTERNS)

    @classmethod
    def _has_copied_admission(cls, text: str) -> bool:
        lower = (text or "").lower()
        return any(phrase in lower for phrase in cls.COPIED_PHRASES)

    @staticmethod
    def _build_history_summary(turns: List[Dict[str, Any]]) -> str:
        """
        Compresses multi-turn history to eliminate LLM context-window bloat.
        Older rounds (>2 turns back) are rolled into 1-line STAR digests;
        only the latest 2 completed turns retain dialogue detail.
        """
        completed = [t for t in turns if t.get("answer")]
        if not completed:
            return "No prior answers yet."

        lines: List[str] = []
        older = completed[:-2]
        recent = completed[-2:]

        if older:
            digest_items = []
            for idx, t in enumerate(older, start=1):
                ev = t.get("evaluation") or {}
                star = ev.get("star_score", "N/A")
                critique_short = (ev.get("critique") or "")[:80].replace("\n", " ")
                digest_items.append(f"R{idx} ({star}/100): {critique_short}")
            lines.append("Earlier Rounds Digest: " + " | ".join(digest_items))

        start_idx = len(older) + 1
        for offset, t in enumerate(recent):
            r_num = start_idx + offset
            ev = t.get("evaluation") or {}
            lines.append(
                f"[Round {r_num}] Q: {t.get('question', '')[:160]}\n"
                f"Candidate Answer: {t.get('answer', '')[:320]}\n"
                f"STAR Score: {ev.get('star_score', 'N/A')}/100 | Critique: {ev.get('critique', '')[:110]}"
            )

        return "\n".join(lines)

    def start_interview(
        self,
        candidate_name: Optional[str] = None,
        target_role: Optional[str] = None,
        resume_id: Optional[int] = None,
        user_id: Optional[int] = None,
        max_rounds: int = 4
    ) -> Dict[str, Any]:
        """
        Initializes an interview session with a tailored greeting and opening question.
        """
        candidate_summary = ""
        resolved_name = candidate_name

        if resume_id:
            try:
                resume = Resume.objects.filter(id=resume_id).first()
                if resume and resume.extracted_text:
                    candidate_summary = resume.extracted_text[:1000]
                    parser_res = getattr(resume, "parser_result", None)
                    parsed = getattr(parser_res, "parsed_data", None) if parser_res else None
                    if not resolved_name and isinstance(parsed, dict):
                        resolved_name = parsed.get("name")
            except Exception as e:
                logger.warning("Could not load resume data for interview start: %s", e)

        resolved_name = resolved_name or "Candidate"
        resolved_role = target_role or "Senior Software Engineer"

        session = session_manager.create_session(
            candidate_name=resolved_name,
            target_role=resolved_role,
            resume_id=resume_id,
            user_id=user_id,
            max_rounds=max_rounds,
            candidate_summary=candidate_summary,
        )

        first_question = (
            f"Hey {resolved_name}, great to meet you! Thanks for hopping on today. To get us rolling, tell me a bit about what you've been focused on recently, and walk me through a key project you're really proud of."
        )

        audio_b64 = None
        try:
            from AI.Services.RealVoiceService import RealVoiceService
            audio_b64 = RealVoiceService.synthesize_to_base64(first_question)
        except Exception as e:
            logger.warning("Could not synthesize opening voice: %s", e)

        # Store initial question and candidate summary in session state
        session["candidate_summary"] = candidate_summary
        session["current_question"] = first_question
        session["turns"].append({
            "round": 1,
            "question": first_question,
            "answer": None,
            "evaluation": None,
            "timestamp": time.time()
        })
        session_manager.save_session(session["session_id"], session)

        return {
            "session_id": session["session_id"],
            "candidate_name": resolved_name,
            "target_role": resolved_role,
            "current_round": 1,
            "max_rounds": max_rounds,
            "greeting": f"Hey {resolved_name}, welcome to your executive mock interview. Let's make every answer count.",
            "question": first_question,
            "audio_base64": audio_b64,
            "category": "Experience & Impact"
        }

    def evaluate_turn(
        self,
        session_id: str,
        candidate_answer: str,
        client_telemetry: Optional[Dict[str, Any]] = None,
        snapshot_base64: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluates the candidate's answer for the current round and generates
        the next question or closing remarks, adaptively tuned to candidate's
        emotional and visual demeanor.
        """
        session = session_manager.get_session(session_id)
        if not session:
            raise ValueError(f"Interview session '{session_id}' not found or expired.")

        current_round = session.get("current_round", 1)
        max_rounds = session.get("max_rounds", 4)
        last_question = session.get("current_question", "Tell me about your experience.")
        candidate_name = session.get("candidate_name", "Candidate")
        target_role = session.get("target_role", "Software Engineer")

        # Process vision and behavioral telemetry with turn-level throttling inside CandidateVisionService
        vision_metrics = CandidateVisionService.process_telemetry(
            client_telemetry=client_telemetry,
            snapshot_base64=snapshot_base64,
            session_id=session_id,
        )

        # Build compressed rolling dialogue history summary
        history_summary = self._build_history_summary(session.get("turns", []))

        # Candidate summary from resume or dynamic session context
        candidate_summary = session.get("candidate_summary") or f"Applying for {target_role}"
        ans_lower = candidate_answer.lower()
        is_explicit_senior = any(
            re.search(r'\b' + re.escape(w) + r'\b', ans_lower)
            for w in ["senior", "lead", "architect", "principal", "staff", "10 years", "8 years", "7 years", "director", "manager", "staff engineer", "tech lead"]
        )
        mentorship_present = any(
            re.search(r'\b' + re.escape(w) + r'\b', ans_lower)
            for w in ["mentored", "mentoring", "coached", "supervised", "managed", "leading", "delegated"]
        )
        is_explicit_junior = any(
            re.search(r'\b' + re.escape(w) + r'\b', ans_lower)
            for w in ["i am a fresher", "as a fresher", "fresher", "as an intern", "i was an intern", "i am an intern", "college student", "just graduated", "final year", "3rd year", "4th year", "beginner"]
        )

        if is_explicit_senior or (mentorship_present and not is_explicit_junior):
            candidate_summary += " | SENIORITY: Senior / Staff / Architect. Calibrate questions to distributed systems, scalability, trade-offs, and failure scenarios."
        elif is_explicit_junior and not is_explicit_senior:
            candidate_summary += " | SENIORITY: Junior / Fresher / Student. Calibrate questions to fundamentals, core algorithms, and personal projects. Be conversational, supportive, and provide hints if they get stuck."

        prompt_text = VIRTUAL_HR_EVALUATION_PROMPT.format(
            candidate_name=candidate_name,
            target_role=target_role,
            candidate_summary=candidate_summary,
            current_round=current_round,
            max_rounds=max_rounds,
            last_question=last_question,
            candidate_answer=candidate_answer.strip()[:3000],
            history_summary=history_summary,
            eye_contact_pct=vision_metrics.eye_contact_percentage,
            confidence_score=vision_metrics.confidence_score,
            nervousness_score=vision_metrics.nervousness_score,
            gaze_direction=vision_metrics.gaze_direction,
            facial_demeanor=vision_metrics.facial_demeanor
        )

        try:
            self._ensure_llm()
            eval_result: InterviewTurnEvaluation = self.turn_evaluator.invoke(prompt_text)
            eval_result.vision = vision_metrics
        except Exception as exc:
            logger.exception("Virtual HR turn evaluation failed, using fallback: %s", exc)
            eval_result = self._fallback_turn_evaluation(
                candidate_answer,
                current_round,
                max_rounds,
                vision_metrics
            )

        # Update current turn record
        turns = session.get("turns", [])
        if turns:
            turns[-1]["answer"] = candidate_answer
            turns[-1]["evaluation"] = eval_result.model_dump()

        is_finished = current_round >= max_rounds or eval_result.is_final_round

        if not is_finished:
            next_round = current_round + 1
            session["current_round"] = next_round
            session["current_question"] = eval_result.hr_followup_or_next_question
            turns.append({
                "round": next_round,
                "question": eval_result.hr_followup_or_next_question,
                "answer": None,
                "evaluation": None,
                "timestamp": time.time()
            })
        else:
            session["status"] = "completed"

        session["turns"] = turns
        session_manager.save_session(session_id, session)

        next_q = eval_result.hr_followup_or_next_question if not is_finished else None
        spoken_dialogue = next_q or eval_result.critique
        audio_b64 = None
        if spoken_dialogue:
            try:
                from AI.Services.RealVoiceService import RealVoiceService
                audio_b64 = RealVoiceService.synthesize_to_base64(spoken_dialogue)
            except Exception as e:
                logger.warning("Could not synthesize follow-up voice: %s", e)

        return {
            "session_id": session_id,
            "round_evaluated": current_round,
            "next_round": current_round + 1 if not is_finished else current_round,
            "max_rounds": max_rounds,
            "is_final_round": is_finished,
            "evaluation": eval_result.model_dump(),
            "next_question": next_q,
            "audio_base64": audio_b64
        }

    def finish_interview(self, session_id: str) -> Dict[str, Any]:
        """
        Compiles the full post-interview hiring scorecard.
        """
        session = session_manager.get_session(session_id)
        if not session:
            raise ValueError(f"Interview session '{session_id}' not found.")

        # If already compiled, return cached scorecard
        if session.get("scorecard"):
            return {
                "session_id": session_id,
                "status": "completed",
                "scorecard": session["scorecard"],
                "turns": session.get("turns", [])
            }

        candidate_name = session.get("candidate_name", "Candidate")
        target_role = session.get("target_role", "Software Engineer")

        # Compile full transcript with vision telemetry
        transcript_parts = []
        vision_records = []
        for idx, t in enumerate(session.get("turns", []), 1):
            q = t.get("question", "")
            a = t.get("answer", "No answer provided")
            ev = t.get("evaluation") or {}
            star = ev.get("star_score", 70)
            vis = ev.get("vision") or {}
            if vis:
                vision_records.append(vis)
            eye_str = f"Eye Contact: {vis.get('eye_contact_percentage', 85)}% ({vis.get('gaze_direction', 'Direct')}), Demeanor: {vis.get('facial_demeanor', 'Composed')}"
            transcript_parts.append(
                f"--- Round {idx} ---\nQuestion: {q}\nAnswer: {a}\nSTAR Score: {star}/100\nBehavioral: {eye_str}"
            )

        full_transcript = "\n\n".join(transcript_parts) if transcript_parts else "Brief single-turn interview."

        prompt_text = VIRTUAL_HR_SCORECARD_PROMPT.format(
            candidate_name=candidate_name,
            target_role=target_role,
            full_transcript=full_transcript
        )

        try:
            self._ensure_llm()
            scorecard: InterviewFinalScorecard = self.scorecard_compiler.invoke(prompt_text)
            scorecard_data = scorecard.model_dump()
        except Exception as exc:
            logger.exception("Virtual HR scorecard compilation failed, using fallback: %s", exc)
            scorecard_data = self._fallback_scorecard(session, vision_records)

        session["status"] = "completed"
        session["scorecard"] = scorecard_data
        session_manager.save_session(session_id, session)

        return {
            "session_id": session_id,
            "status": "completed",
            "scorecard": scorecard_data,
            "turns": session.get("turns", [])
        }

    def _fallback_turn_evaluation(
        self,
        answer: str,
        current_round: int,
        max_rounds: int,
        vision_metrics: Optional[VisionTelemetry] = None
    ) -> InterviewTurnEvaluation:
        ans_lower = answer.lower()
        has_profanity = self._has_profanity(answer)
        is_copied = self._has_copied_admission(answer)

        words = answer.strip().split()
        word_count = len(words)
        is_brief_shrug = any(phrase in ans_lower for phrase in self.SHRUG_PHRASES) and word_count <= 8

        is_camera_off = (
            not vision_metrics or
            vision_metrics.gaze_direction in ["Camera Off / Disabled", "Camera Disabled (Audio / Text Mode)"] or
            vision_metrics.facial_demeanor == "Camera Off" or
            vision_metrics.eye_contact_percentage == 0
        )

        behavioral_critique = "Balanced delivery pace."
        if is_camera_off:
            behavioral_critique = "Your camera is currently turned off. In a remote technical interview, having your video turned on helps establish trust, engagement, and executive presence."
        elif vision_metrics and vision_metrics.nervousness_score > 60:
            behavioral_critique = "You seem a little nervous or rushed. Remember to take a steady breath before detailing complex steps."
        elif vision_metrics and vision_metrics.confidence_score > 80:
            behavioral_critique = "Strong, composed eye contact and assertive executive posture."

        # Case 1: Inappropriate / Profanity / Hostility
        if has_profanity:
            return InterviewTurnEvaluation(
                star_score=5,
                clarity_score=10,
                strengths=[],
                critique="Inappropriate and unprofessional language detected. Hostile behavior in an interview is an immediate disqualifier and hard No-Hire.",
                behavioral_critique="Completely unprofessional demeanor.",
                adaptive_hr_tone="Firm / Serious",
                hr_followup_or_next_question="Whoa, let's pause right there. Professionalism is non-negotiable in an engineering interview. If you want to continue, please keep your answers strictly professional.",
                question_category="Professionalism & Conduct",
                is_final_round=current_round >= max_rounds,
                vision=vision_metrics
            )

        # Case 2: Flippant or Copied Code
        if is_copied:
            cam_note = " By the way, could you turn your camera on so we can see each other?" if is_camera_off else ""
            return InterviewTurnEvaluation(
                star_score=25,
                clarity_score=35,
                strengths=["Honesty about code origin"],
                critique="Admitting to simply copying code without understanding it is an immediate red flag for hiring managers. Always explain how you tested, debugged, and integrated the solution.",
                behavioral_critique=behavioral_critique,
                adaptive_hr_tone="Probing / Realistic",
                hr_followup_or_next_question=f"Being honest is good, but saying you only copy code is a red flag in technical screens. When you pull in third-party or open-source code, how do you verify it's secure, performant, and works?{cam_note}",
                question_category="Technical Ownership",
                is_final_round=current_round >= max_rounds,
                vision=vision_metrics
            )

        # Case 2.5: Brief Unelaborated Shrug ("don't know")
        if is_brief_shrug:
            cam_note = " Also, feel free to turn your video on if possible." if is_camera_off else ""
            return InterviewTurnEvaluation(
                star_score=35,
                clarity_score=40,
                strengths=["Humility in acknowledging knowledge limits"],
                critique="When you encounter an unfamiliar concept in an interview, don't just stop at 'I don't know'. Talk through what adjacent concepts you do understand, or how you would investigate the problem.",
                behavioral_critique=behavioral_critique,
                adaptive_hr_tone="Encouraging / Socratic",
                hr_followup_or_next_question=f"It's completely fine not to know every technology off the top of your head. If you were faced with this problem in production, what first principles or debugging tools would you use to figure it out?{cam_note}",
                question_category="Problem Solving & Adaptability",
                is_final_round=current_round >= max_rounds,
                vision=vision_metrics
            )

        # Case 3: One-Word / Low-Effort Answer
        if word_count <= 3:
            cam_note = " Also, try turning on your video so we can connect face-to-face." if is_camera_off else ""
            return InterviewTurnEvaluation(
                star_score=25,
                clarity_score=30,
                strengths=[],
                critique="One-word answers give the interviewer zero signal to assess your technical depth or problem solving. Take the lead and describe your technical contributions.",
                behavioral_critique=behavioral_critique,
                adaptive_hr_tone="Encouraging / Probing",
                hr_followup_or_next_question=f"I need a bit more detail to evaluate your engineering skills. Walk me through a specific system you worked on and what technologies you actually built with.{cam_note}",
                question_category="Experience & Impact",
                is_final_round=current_round >= max_rounds,
                vision=vision_metrics
            )

        # Case 4: Normal Technical Answer (Dynamically Calibrated to Seniority)
        has_metrics = any(char.isdigit() for char in answer)
        star_score = min(92, max(60, 65 + (15 if has_metrics else 0) + (10 if word_count > 40 else 0)))
        clarity_score = 85 if word_count >= 30 else 70
        is_senior = any(re.search(r'\b' + re.escape(w) + r'\b', ans_lower) for w in ["senior", "lead", "architect", "principal", "staff", "10 years", "8 years", "7 years"])
        is_junior = not is_senior and any(re.search(r'\b' + re.escape(k) + r'\b', ans_lower) for k in ["fresher", "junior", "college student", "student", "beginner", "just graduated", "final year", "3rd year", "4th year"])

        if is_camera_off:
            next_q = "Got it, that makes sense. By the way, if you can turn your camera on, it helps a lot to see each other. Tell me about a time when you faced a difficult technical bottleneck on that project?"
        elif is_junior:
            if current_round == 2:
                next_q = "That's a great project to build! When you were writing the code, what was one bug or error that really stumped you, and how did you figure out how to fix it?"
            elif current_round == 3:
                next_q = "Debugging is where real learning happens. When you work on projects with classmates, how do you handle dividing tasks or resolving disagreements on how to build it?"
            else:
                next_q = "Looking back at that project, what's one new technology or concept you're most excited to learn next in your engineering career?"
        elif current_round == 2:
            next_q = "Nice, that's really cool. When you built that, what was the biggest technical challenge or bottleneck you ran into, and how did you resolve it?"
        elif current_round == 3:
            next_q = "That makes total sense. Now tell me about a time when you had a disagreement with your team or product manager on how to build something. How did you work through that?"
        else:
            next_q = "If you were starting that whole system over today from scratch, what's one thing you would architect completely differently?"

        return InterviewTurnEvaluation(
            star_score=star_score,
            clarity_score=clarity_score,
            strengths=["Structured communication", "Direct ownership of outcomes"],
            critique="Add specific quantifiable metrics (percentages, team sizes, latency) to make the impact unquestionable.",
            behavioral_critique=behavioral_critique,
            adaptive_hr_tone="Direct / Structured",
            hr_followup_or_next_question=next_q,
            question_category="Behavioral & Problem Solving",
            is_final_round=current_round >= max_rounds,
            vision=vision_metrics
        )

    def _fallback_scorecard(self, session: Dict[str, Any], vision_records: list = None) -> Dict[str, Any]:
        turns = session.get("turns", [])
        answers = [t.get("answer", "") or "" for t in turns]
        all_text = " ".join(answers)

        has_profanity = self._has_profanity(all_text)
        total_words = sum(len(a.split()) for a in answers)
        avg_words = total_words / max(1, len(answers))
        has_copied = any(self._has_copied_admission(a) for a in answers)

        avg_eye = 0
        avg_conf = 30
        if vision_records:
            valid_eyes = [v.get("eye_contact_percentage", 0) for v in vision_records if v.get("eye_contact_percentage", 0) > 0]
            if valid_eyes:
                avg_eye = int(sum(valid_eyes) / len(valid_eyes))
            valid_conf = [v.get("confidence_score", 0) for v in vision_records if v.get("confidence_score", 0) > 0]
            if valid_conf:
                avg_conf = int(sum(valid_conf) / len(valid_conf))

        # Check for profanity / hostility -> IMMEDIATE NO HIRE
        if has_profanity:
            return {
                "overall_score": 15,
                "verdict": "Needs Practice",
                "summary": "Candidate exhibited hostile and unprofessional conduct, using offensive language during the evaluation. Immediate No-Hire in any corporate or engineering interview process.",
                "communication_score": 10,
                "technical_depth_score": 15,
                "problem_solving_score": 15,
                "leadership_score": 5,
                "top_strengths": ["None demonstrated during session"],
                "critical_gaps": [
                    "Used offensive and inappropriate language during the interview",
                    "Did not attempt to provide constructive technical answers",
                    "Failed basic workplace communication and behavioral standards"
                ],
                "preparation_recommendations": [
                    "Maintain strict professional decorum in all interview interactions",
                    "Review basic corporate interview etiquette and communication standards",
                    "Prepare structured technical examples rather than expressing frustration"
                ],
                "behavioral_delivery": {
                    "average_eye_contact": avg_eye,
                    "average_confidence": 10,
                    "composure_under_pressure": 10,
                    "executive_presence_grade": "Anxious / Needs Coaching",
                    "presence_strengths": ["None observed"],
                    "presence_areas_to_improve": [
                        "Complete lack of emotional composure under questioning",
                        "Must maintain professional respect toward the interviewer"
                    ]
                }
            }

        # Check for minimal or copied answers -> NO HIRE
        if avg_words < 12 or has_copied:
            return {
                "overall_score": 35,
                "verdict": "Needs Practice",
                "summary": "Candidate gave minimal, one-word, or copied answers and failed to demonstrate technical depth or problem-solving ownership required for this role.",
                "communication_score": 35,
                "technical_depth_score": 30,
                "problem_solving_score": 35,
                "leadership_score": 30,
                "top_strengths": [
                    "Honesty regarding code familiarity"
                ],
                "critical_gaps": [
                    "Relied on copied code without explaining architecture or trade-offs",
                    "Gave very short, unelaborated responses with minimal technical signal",
                    "Did not structure answers using the STAR method"
                ],
                "preparation_recommendations": [
                    "Practice elaborating on technical contributions with specific metrics",
                    "Be prepared to explain the internal mechanisms of code you integrate",
                    "Turn on your camera to build engagement and trust in remote calls"
                ],
                "behavioral_delivery": {
                    "average_eye_contact": avg_eye,
                    "average_confidence": avg_conf,
                    "composure_under_pressure": 40,
                    "executive_presence_grade": "Anxious / Needs Coaching",
                    "presence_strengths": ["Participated in mock session"],
                    "presence_areas_to_improve": [
                        "Enable webcam during live interviews to project confidence",
                        "Elaborate more proactively on technical responses"
                    ]
                }
            }

        plan_7_days = [
            {"day": 1, "focus": "STAR Structure & Framing", "exercise": "Rewrite your primary project story into Situation (15s), Task (10s), Action (45s), Result (20s).", "target_metric": "Strict 90-second delivery with zero rambling"},
            {"day": 2, "focus": "Quantified Business Metrics", "exercise": "Add exact latency reductions, user scale numbers, or error drop percentages to your answers.", "target_metric": "Every response contains at least 2 verified numbers"},
            {"day": 3, "focus": "Failure Recovery & Trade-Offs", "exercise": "Prepare a 2-minute drill on an incident where things broke and how you handled the post-mortem.", "target_metric": "Clear accountability without blaming vendors or peers"},
            {"day": 4, "focus": "Architectural Deep Dive", "exercise": "Draw out your project architecture on paper and practice explaining bottlenecks and caching layers.", "target_metric": "Defend 3 specific design choices (e.g. Postgres vs Mongo, REST vs GraphQL)"},
            {"day": 5, "focus": "Executive Brevity & Voice Clarity", "exercise": "Record audio responses on your phone and listen for filler words ('um', 'like', 'basically').", "target_metric": "< 2 filler words per 60 seconds"},
            {"day": 6, "focus": "Full Marcus 3D Mock Simulation", "exercise": "Run a full 4-round live mock session focusing on steady eye contact and structured delivery.", "target_metric": "Overall score >= 88% and 'Strong & Composed' grade"},
            {"day": 7, "focus": "Reverse Interview Questions", "exercise": "Prepare 3 strategic questions for the interviewer regarding team velocity, SLAs, and technical roadmap.", "target_metric": "High-signal questions demonstrating seniority"}
        ]

        # Normal passing candidate
        return {
            "overall_score": 88,
            "verdict": "Hire",
            "summary": "Candidate demonstrated solid domain understanding, structured STAR delivery, and strong composure under questioning.",
            "communication_score": 86,
            "technical_depth_score": 89,
            "problem_solving_score": 90,
            "leadership_score": 85,
            "top_strengths": [
                "Clear STAR narrative structuring",
                "Demonstrated accountability under constraints",
                "Action-oriented problem resolution"
            ],
            "critical_gaps": [
                "Could quantify business scale and team dynamics more consistently",
                "Opportunity to elaborate on post-incident retrospectives"
            ],
            "preparation_recommendations": [
                "Practice the 'Situation-Task-Action-Result' format with numbers in every answer",
                "Have 2-3 executive-ready metrics memorized for each major career project",
                "Focus on 'I' contributions rather than diffuse 'we' descriptions"
            ],
            "practice_plan_7_days": plan_7_days,
            "behavioral_delivery": {
                "average_eye_contact": avg_eye or 82,
                "average_confidence": avg_conf or 80,
                "composure_under_pressure": 88,
                "executive_presence_grade": "Strong & Composed",
                "presence_strengths": [
                    "Maintained natural camera-level eye contact throughout core answers",
                    "Steady vocal articulation without rushed nervous fillers"
                ],
                "presence_areas_to_improve": [
                    "Slight downward gaze shift when recalling technical metrics",
                    "Keep hands rested calmly to avoid unintentional micro-fidgeting"
                ]
            }
        }
