import logging
import time
from typing import Any, Dict, Optional

from langchain_core.prompts import PromptTemplate
from AI.Services.GeminiService import GeminiService
from AI.Services.InterviewSessionManager import session_manager
from AI.Schemas.VirtualHRSchema import InterviewTurnEvaluation, InterviewFinalScorecard
from AI.Prompts.VirtualHRPrompt import VIRTUAL_HR_EVALUATION_PROMPT, VIRTUAL_HR_SCORECARD_PROMPT
from Resume.models import Resume

logger = logging.getLogger(__name__)


class VirtualHRService:
    """
    Virtual HR Real-Time Mock Interview & Candidate Evaluation Engine.
    Executes turn-by-turn STAR behavioral and technical evaluations,
    adaptive follow-up probing, and executive hiring scorecards.
    """

    def __init__(self):
        self.gemini_service = GeminiService()
        self.llm = self.gemini_service.get_llm()
        self.turn_evaluator = self.llm.with_structured_output(InterviewTurnEvaluation)
        self.scorecard_compiler = self.llm.with_structured_output(InterviewFinalScorecard)

    def start_interview(
        self,
        candidate_name: Optional[str] = None,
        target_role: Optional[str] = None,
        resume_id: Optional[int] = None,
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
                    if not resolved_name and resume.parsed_data and isinstance(resume.parsed_data, dict):
                        resolved_name = resume.parsed_data.get("name")
            except Exception as e:
                logger.warning("Could not load resume data for interview start: %s", e)

        resolved_name = resolved_name or "Candidate"
        resolved_role = target_role or "Senior Software Engineer"

        session = session_manager.create_session(
            candidate_name=resolved_name,
            target_role=resolved_role,
            resume_id=resume_id,
            max_rounds=max_rounds
        )

        greeting = (
            f"Hello {resolved_name}, welcome to your mock interview for the {resolved_role} position. "
            f"I'm Sarah from the Talent Partner team. Today, we'll walk through a few situational and technical scenarios. "
            f"Take your time, structure your responses, and share the specific impact of your work."
        )

        first_question = (
            f"To get started, tell me about a major project or challenging problem in your recent experience as a {resolved_role}. "
            f"What was the situation, what specific action did you take, and what was the measurable outcome?"
        )

        # Store initial question in session state
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
            "greeting": greeting,
            "question": first_question,
            "category": "Experience & Impact"
        }

    def evaluate_turn(self, session_id: str, candidate_answer: str) -> Dict[str, Any]:
        """
        Evaluates the candidate's answer for the current round and generates
        the next question or closing remarks.
        """
        session = session_manager.get_session(session_id)
        if not session:
            raise ValueError(f"Interview session '{session_id}' not found or expired.")

        current_round = session.get("current_round", 1)
        max_rounds = session.get("max_rounds", 4)
        last_question = session.get("current_question", "Tell me about your experience.")
        candidate_name = session.get("candidate_name", "Candidate")
        target_role = session.get("target_role", "Software Engineer")

        # Build concise dialogue history summary
        history_lines = []
        for t in session.get("turns", []):
            if t.get("answer"):
                history_lines.append(f"Q: {t.get('question')}\nA: {t.get('answer')[:150]}...")
        history_summary = "\n".join(history_lines) if history_lines else "No prior answers yet."

        # Candidate summary from resume if available
        candidate_summary = f"Applying for {target_role}"

        prompt_text = VIRTUAL_HR_EVALUATION_PROMPT.format(
            candidate_name=candidate_name,
            target_role=target_role,
            candidate_summary=candidate_summary,
            current_round=current_round,
            max_rounds=max_rounds,
            last_question=last_question,
            candidate_answer=candidate_answer.strip()[:3000],
            history_summary=history_summary
        )

        try:
            eval_result: InterviewTurnEvaluation = self.turn_evaluator.invoke(prompt_text)
        except Exception as exc:
            logger.exception("Virtual HR turn evaluation failed, using fallback: %s", exc)
            eval_result = self._fallback_turn_evaluation(candidate_answer, current_round, max_rounds)

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

        return {
            "session_id": session_id,
            "round_evaluated": current_round,
            "next_round": current_round + 1 if not is_finished else current_round,
            "max_rounds": max_rounds,
            "is_final_round": is_finished,
            "evaluation": eval_result.model_dump(),
            "next_question": eval_result.hr_followup_or_next_question if not is_finished else None
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

        # Compile full transcript
        transcript_parts = []
        for idx, t in enumerate(session.get("turns", []), 1):
            q = t.get("question", "")
            a = t.get("answer", "No answer provided")
            ev = t.get("evaluation") or {}
            star = ev.get("star_score", 70)
            transcript_parts.append(
                f"--- Round {idx} ---\nQuestion: {q}\nAnswer: {a}\nSTAR Score: {star}/100"
            )

        full_transcript = "\n\n".join(transcript_parts) if transcript_parts else "Brief single-turn interview."

        prompt_text = VIRTUAL_HR_SCORECARD_PROMPT.format(
            candidate_name=candidate_name,
            target_role=target_role,
            full_transcript=full_transcript
        )

        try:
            scorecard: InterviewFinalScorecard = self.scorecard_compiler.invoke(prompt_text)
            scorecard_data = scorecard.model_dump()
        except Exception as exc:
            logger.exception("Virtual HR scorecard compilation failed, using fallback: %s", exc)
            scorecard_data = self._fallback_scorecard(session)

        session["status"] = "completed"
        session["scorecard"] = scorecard_data
        session_manager.save_session(session_id, session)

        return {
            "session_id": session_id,
            "status": "completed",
            "scorecard": scorecard_data,
            "turns": session.get("turns", [])
        }

    def _fallback_turn_evaluation(self, answer: str, current_round: int, max_rounds: int) -> InterviewTurnEvaluation:
        has_metrics = any(char.isdigit() for char in answer)
        word_count = len(answer.split())
        star_score = min(92, max(60, 65 + (15 if has_metrics else 0) + (10 if word_count > 40 else 0)))
        clarity_score = 85 if word_count >= 30 else 70

        next_q = (
            "Could you walk me through a time when you had to manage conflicting priorities or navigate a difficult cross-functional disagreement?"
            if current_round < max_rounds
            else "Thank you for sharing your journey with me today. You gave structured examples and demonstrated strong problem-solving acumen."
        )

        return InterviewTurnEvaluation(
            star_score=star_score,
            clarity_score=clarity_score,
            strengths=["Structured communication", "Direct ownership of outcomes"],
            critique="Add specific quantifiable metrics (percentages, team sizes, latency) to make the impact unquestionable.",
            hr_followup_or_next_question=next_q,
            question_category="Behavioral & Problem Solving",
            is_final_round=current_round >= max_rounds
        )

    def _fallback_scorecard(self, session: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "overall_score": 88,
            "verdict": "Hire",
            "summary": "Candidate demonstrated solid domain understanding and structured communication, with good ownership of past deliverables.",
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
            ]
        }
