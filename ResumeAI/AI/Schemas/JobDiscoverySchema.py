from typing import List, Optional
from pydantic import BaseModel, Field


class DiscoveredJob(BaseModel):
    id: Optional[str] = None
    title: str = Field(description="Official job title")
    company: str = Field(description="Hiring company name")
    location: str = Field(description="City and region or Remote")
    work_type: str = Field(default="Hybrid", description="Remote, Hybrid, or On-site")
    distance_commute: str = Field(default="Near City Center", description="Estimated proximity or commute range")
    match_percentage: int = Field(ge=0, le=100, description="Match alignment percentage")
    salary_range: str = Field(default="Competitive", description="Estimated compensation bracket")
    experience_required: str = Field(default="3+ years", description="Experience level requirement")
    matched_skills: List[str] = Field(default_factory=list, description="Skills candidate possesses that match this role")
    missing_skills: List[str] = Field(default_factory=list, description="Desirable skills missing from candidate resume")
    description_snippet: str = Field(default="", description="Key responsibilities and engineering requirements")
    apply_url: str = Field(default="", description="Search or application URL for this role")
    match_rationale: str = Field(default="", description="Strategic justification for why this candidate is a strong fit")


class JobDiscoveryResponseSchema(BaseModel):
    candidate_location: str = Field(description="Detected or specified candidate search location")
    total_jobs_found: int = Field(ge=0, description="Count of matched opportunities")
    jobs: List[DiscoveredJob] = Field(default_factory=list, description="List of proximity and stack matched jobs")
    search_summary: str = Field(default="", description="High-level engineering market summary for this profile")
