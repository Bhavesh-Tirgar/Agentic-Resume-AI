from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class EducationItem(BaseModel):
    degree: str = Field(default="", description="Degree, diploma, or field of study")
    institution: str = Field(default="", description="School, university, or college name")
    location: str = Field(default="", description="City, state, or country")
    start_date: str = Field(default="", description="Start year or date")
    end_date: str = Field(default="", description="End year or Expected completion")
    grade: str = Field(default="", description="GPA, percentage, or honors if stated")
    description: str = Field(default="", description="Notable coursework or activities")


class ExperienceItem(BaseModel):
    role: str = Field(default="", description="Job title or role designation")
    organization: str = Field(default="", description="Company, organization, or employer name")
    location: str = Field(default="", description="City, state, or Remote")
    start_date: str = Field(default="", description="Start date (Month Year or Year)")
    end_date: str = Field(default="", description="End date or 'Present'")
    currently_working: bool = Field(default=False, description="Whether this is the candidate's current role")
    description: str = Field(default="", description="Summary of responsibilities and achievements")
    technologies: List[str] = Field(default_factory=list, description="Tools, methodologies, or platforms used")


class ProjectItem(BaseModel):
    name: str = Field(default="", description="Project name")
    description: str = Field(default="", description="Key purpose, architecture, and outcomes")
    technologies: List[str] = Field(default_factory=list, description="Technologies or tools leveraged")
    github_url: str = Field(default="", description="Repository or documentation URL if mentioned")
    live_url: str = Field(default="", description="Live deployment or demonstration URL if mentioned")


class CertificationItem(BaseModel):
    name: str = Field(default="", description="Certification title")
    organization: str = Field(default="", description="Issuing body, e.g. AWS, CFA, PMI")
    issue_date: str = Field(default="", description="Date issued")
    credential_id: str = Field(default="", description="Credential ID or verification link")


class CalibratedBullet(BaseModel):
    original: str = Field(description="Original passive or task-based bullet from the resume")
    calibrated: str = Field(description="High-impact rewritten bullet with active verb, scope, and metric impact")
    impact_factor: str = Field(description="Quantified impact metric, e.g. '+38% ATS Impact'")
    category: str = Field(description="Discipline category, e.g. Leadership, Scale, Revenue, Efficiency, or Compliance")


class AuditFinding(BaseModel):
    category: Literal["strength", "gap", "calibration"] = Field(description="Finding category: strength, gap, or calibration")
    title: str = Field(description="Brief headline summarizing the audit observation")
    description: str = Field(description="Detailed explanation of the screener finding")
    remedy: Optional[str] = Field(default=None, description="Recommended adjustment to maximize ATS score")


class ScoreBreakdown(BaseModel):
    overall: int = Field(ge=0, le=100, description="Overall ATS compatibility score from 0 to 100")
    content: int = Field(ge=0, le=100, description="Score for quantifiable metrics, action verbs, and business outcomes")
    format: int = Field(ge=0, le=100, description="Score for single-column linear layout compliance")
    keyword: int = Field(ge=0, le=100, description="Score for industry terminology and hard skill density")
    readability: int = Field(ge=0, le=100, description="Score for conciseness, grammar, and typography structure")
    percentile_label: str = Field(default="Top 10% Candidate", description="Candidate ranking percentile label")
    summary_critique: str = Field(default="", description="2-sentence executive summary of the resume quality")


class UnifiedDossierSchema(BaseModel):
    """
    Consolidated Single-Shot Dossier Schema.
    Combines parsing, diagnostic scoring, and bullet calibration into 1 payload.
    """
    full_name: str = Field(default="", description="Full name of candidate")
    email: Optional[str] = Field(default=None, description="Primary email address")
    phone: str = Field(default="", description="Primary contact phone number")
    location: str = Field(default="", description="City, state, or country of residence")
    headline: str = Field(default="", description="Target or current professional title")
    professional_summary: str = Field(default="", description="Executive career summary")

    work_experience: List[ExperienceItem] = Field(default_factory=list, description="Work experience history")
    education: List[EducationItem] = Field(default_factory=list, description="Educational qualifications")
    projects: List[ProjectItem] = Field(default_factory=list, description="Key projects or initiatives")
    skills: List[str] = Field(default_factory=list, description="Hard and functional skills list")
    certifications: List[CertificationItem] = Field(default_factory=list, description="Certifications and credentials")
    languages: List[str] = Field(default_factory=list, description="Languages spoken")

    score: ScoreBreakdown = Field(description="5-dimensional ATS diagnostic scoring breakdown")
    findings: List[AuditFinding] = Field(default_factory=list, description="Recruiter and screener audit findings")
    calibrated_bullets: List[CalibratedBullet] = Field(default_factory=list, description="Top 3-4 calibrated bullet rewrites")
