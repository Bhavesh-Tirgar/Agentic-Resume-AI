from typing import List, Optional
from pydantic import BaseModel, Field


class MatchedSkillEvidence(BaseModel):
    skill: str
    evidence: str = Field(default="strong", description="strong, moderate, or listed_only")
    where: str = Field(default="Experience / Projects", description="Where in resume evidence was found")


class AdjacentSkillMatch(BaseModel):
    jd_wants: str
    you_have: str
    credit: float = Field(default=0.6, description="Partial credit between 0.5 and 0.7")


class CompetencyGap(BaseModel):
    skill: str
    type: str = Field(default="must_have", description="must_have or nice_to_have")
    impact: str = Field(default="high", description="high, medium, or low")


class JobMatchSchema(BaseModel):
    """
    Structured result produced by the CareerPilot Job Matching Engine.
    """

    overall_match_score: int = Field(
        ge=0,
        le=100,
        description="Overall compatibility between resume and job."
    )

    skill_match_score: int = Field(
        ge=0,
        le=100,
        description="How well the candidate skills match the job."
    )

    experience_match_score: int = Field(
        ge=0,
        le=100,
        description="How well the candidate experience matches the job."
    )

    education_match_score: int = Field(
        ge=0,
        le=100,
        description="How well the candidate education matches the job."
    )

    matched_skills: List[str] = Field(
        default_factory=list
    )

    missing_skills: List[str] = Field(
        default_factory=list
    )

    matched_keywords: List[str] = Field(
        default_factory=list
    )

    missing_keywords: List[str] = Field(
        default_factory=list
    )

    strengths: List[str] = Field(
        default_factory=list
    )

    gaps: List[str] = Field(
        default_factory=list
    )

    recommendations: List[str] = Field(
        default_factory=list
    )

    # CareerPilot Specific Grounding Fields
    matched_evidence: List[MatchedSkillEvidence] = Field(
        default_factory=list,
        description="Grounded evidence citing specific projects or experience"
    )

    adjacent_matches: List[AdjacentSkillMatch] = Field(
        default_factory=list,
        description="Transferable adjacent competencies granting partial credit"
    )

    structured_gaps: List[CompetencyGap] = Field(
        default_factory=list,
        description="Ranked gaps categorized as must_have vs nice_to_have"
    )

    why_matches: str = Field(
        default="",
        description="One-sentence executive summary of why candidate matches"
    )

    what_blocks: str = Field(
        default="",
        description="One-sentence executive summary of what competencies block qualification"
    )
