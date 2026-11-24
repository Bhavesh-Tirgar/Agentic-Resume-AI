from typing import List, Optional
from pydantic import BaseModel, Field


class RankedSkillGap(BaseModel):
    skill: str = Field(description="Normalized skill identifier")
    display_name: str = Field(description="Formatted name, e.g. 'Docker & Containerization'")
    frequency: int = Field(description="Number of discovered/saved jobs requiring this skill")
    total_jobs_evaluated: int = Field(description="Total number of jobs in candidate's target pipeline")
    unlock_percentage: int = Field(ge=0, le=100, description="Percentage of candidate jobs that unlock or score higher")
    potential_match_boost: int = Field(ge=0, le=100, description="Estimated average match score percentage boost")
    gap_type: str = Field(description="'must_have' | 'adjacent' | 'nice_to_have'")
    is_must_have: bool = Field(description="Whether this is a hard must-have across the target roles")
    interview_correlation: bool = Field(default=False, description="Whether this gap was also flagged in mock interview")
    interview_feedback_snippet: Optional[str] = Field(default=None, description="Direct note or critique from mock interview")
    action_title: str = Field(description="Actionable project task to build competency")
    action_type: str = Field(description="'weekend_project' | 'bridge_exercise' | 'resume_bullet_update' | 'backlog'")
    time_estimate: str = Field(description="Estimated time to complete: '1-2 weekends', '1 weekend', or '1 hour'")
    recommended_project: str = Field(description="Concrete project prompt or step-by-step description")


class RankedGapsResponseSchema(BaseModel):
    total_jobs_analyzed: int = Field(description="Total target jobs evaluated for the candidate")
    total_gaps_identified: int = Field(description="Count of distinct skill gaps across target jobs")
    top_unlock_skill: str = Field(description="The single skill that unlocks the most opportunities first")
    top_unlock_headline: str = Field(description="Strategic executive summary recommendation")
    interview_synergy_count: int = Field(description="Number of gaps that overlap between job requirements and mock interview")
    ranked_gaps: List[RankedSkillGap] = Field(default_factory=list, description="Ordered list of high-ROI skill gaps")
