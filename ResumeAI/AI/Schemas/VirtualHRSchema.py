from typing import List, Optional
from pydantic import BaseModel, Field


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
        description="Communication clarity, conciseness, and executive presence (0-100)."
    )
    strengths: List[str] = Field(
        default_factory=list,
        description="1-2 specific strengths demonstrated in the response."
    )
    critique: str = Field(
        ...,
        description="Immediate, constructive coaching tip on how to elevate the response."
    )
    hr_followup_or_next_question: str = Field(
        ...,
        description="Virtual HR's next question or contextual follow-up probing question."
    )
    question_category: str = Field(
        "Behavioral",
        description="Category: Behavioral, Problem Solving, Technical Execution, Conflict Resolution, or Leadership."
    )
    is_final_round: bool = Field(
        False,
        description="Whether this was the final interview question in the session."
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
