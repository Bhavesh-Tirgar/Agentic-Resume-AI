from typing import List, Optional
from pydantic import BaseModel, Field


class VisionTelemetry(BaseModel):
    """Vision and behavioral biometric telemetry detected from camera feed."""
    eye_contact_percentage: int = Field(
        ...,
        ge=0,
        le=100,
        description="Estimated direct eye contact percentage during response (0-100)."
    )
    confidence_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Confidence & composure level inferred from posture and facial expression (0-100)."
    )
    nervousness_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Nervousness, micro-fidgeting, or tension index (0-100)."
    )
    gaze_direction: str = Field(
        "Direct / Focused",
        description="Gaze assessment: Direct / Focused, Looking Away, Looking Down, or Reading Second Screen."
    )
    facial_demeanor: str = Field(
        "Composed",
        description="Facial expression: Composed, Calm, Tense / Anxious, Engaged, or Hesitant."
    )


class BehavioralScorecard(BaseModel):
    """Executive presence, body language, and poise assessment."""
    average_eye_contact: int = Field(
        ...,
        ge=0,
        le=100,
        description="Overall average eye contact maintained across interview rounds."
    )
    average_confidence: int = Field(
        ...,
        ge=0,
        le=100,
        description="Average confidence rating across all questions."
    )
    composure_under_pressure: int = Field(
        ...,
        ge=0,
        le=100,
        description="Ability to remain relaxed and composed when faced with difficult scenarios."
    )
    executive_presence_grade: str = Field(
        ...,
        description="Executive presence rating: Tier-1 Executive Presence, Strong & Composed, Competent, or Anxious / Needs Coaching."
    )
    presence_strengths: List[str] = Field(
        default_factory=list,
        description="Key delivery, eye-contact, and poise strengths."
    )
    presence_areas_to_improve: List[str] = Field(
        default_factory=list,
        description="Actionable coaching tips on body language and eye contact."
    )


class InterviewTurnEvaluation(BaseModel):
    """Evaluation of candidate's answer for an individual interview round."""
    star_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="STAR framework score (0-100) evaluating Situation, Task, Action, and Result completeness."
    )
    clarity_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Communication clarity, conciseness, and articulation (0-100)."
    )
    strengths: List[str] = Field(
        default_factory=list,
        description="1-2 specific strengths demonstrated in the response."
    )
    critique: str = Field(
        ...,
        description="Constructive coaching tip on the content of the answer."
    )
    behavioral_critique: str = Field(
        "Maintained steady composure and good eye contact.",
        description="Constructive tip regarding body language, eye contact, or nervous pacing."
    )
    adaptive_hr_tone: str = Field(
        "Direct / Structured",
        description="Tone selected by Virtual HR: Encouraging / Calming, Probing / Challenging, or Direct / Structured."
    )
    hr_followup_or_next_question: str = Field(
        ...,
        description="Virtual HR's next question adaptively tuned to both answer content and candidate demeanor."
    )
    question_category: str = Field(
        "Behavioral",
        description="Category: Behavioral, Problem Solving, Technical Execution, Conflict Resolution, or Leadership."
    )
    is_final_round: bool = Field(
        False,
        description="Whether this was the final interview question in the session."
    )
    vision: Optional[VisionTelemetry] = Field(
        None,
        description="Vision and behavioral telemetry metrics for this turn."
    )


class InterviewFinalScorecard(BaseModel):
    """Comprehensive post-interview candidate evaluation scorecard."""
    overall_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Overall hireability rating (0-100)."
    )
    verdict: str = Field(
        ...,
        description="Hiring recommendation: Strong Hire, Hire, Leaning Hire, or Needs Practice."
    )
    summary: str = Field(
        ...,
        description="Executive talent recruiter summary of candidate performance."
    )
    communication_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Verbal articulation, brevity, and confidence score."
    )
    technical_depth_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Domain competence, engineering/functional mastery score."
    )
    problem_solving_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Analytical rigor, trade-off evaluation, and structured thinking score."
    )
    leadership_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Ownership, cross-functional collaboration, and initiative score."
    )
    top_strengths: List[str] = Field(
        default_factory=list,
        description="Key competitive advantages demonstrated by the candidate."
    )
    critical_gaps: List[str] = Field(
        default_factory=list,
        description="Areas where the candidate missed metrics or gave incomplete answers."
    )
    preparation_recommendations: List[str] = Field(
        default_factory=list,
        description="Specific actionable drills for candidate's upcoming real interviews."
    )
    behavioral_delivery: Optional[BehavioralScorecard] = Field(
        None,
        description="Comprehensive body language, eye contact, and executive presence analysis."
    )
