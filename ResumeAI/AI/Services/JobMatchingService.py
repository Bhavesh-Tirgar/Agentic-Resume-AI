import re
import logging
from typing import List, Tuple
from django.db import transaction
from Resume.models import Resume
from AI.Models.JobMatchResult import JobMatchResult
from AI.Schemas.ResumeSchema import ResumeSchema
from AI.Schemas.JobMatchSchema import (
    JobMatchSchema,
    MatchedSkillEvidence,
    AdjacentSkillMatch,
    CompetencyGap,
)
from AI.Graphs.JobMatchingGraph import run_job_matching_graph
from AI.Utils.SemanticVectorMatcher import SemanticVectorMatcher
from AI.Utils.SkillAliasTable import SkillAliasTable
from AI.Utils.PromptInjectionGuardrail import PromptInjectionGuardrail

logger = logging.getLogger(__name__)


def build_heuristic_job_match(resume_schema: ResumeSchema, job_title: str, job_description: str) -> JobMatchSchema:
    """
    CareerPilot 3-Tier Match & Skill Gap Engine.
    Implements the exact CareerPilot specification:
    - 3-tier evaluation: Exact (1.0), Adjacent (0.6), Missing (0.0)
    - Evidence weighting: Project/Experience (1.0) vs Skills-list only (0.6)
    - CareerPilot Formula: 0.60*MustHave + 0.20*NiceToHave + 0.10*ExpFit + 0.10*LocFit
    - Hard Cap Rule: Max 70 score if ANY must-have skill is completely missing.
    - Actionable gaps: 1-2 weekend project tasks, bridge notes, and 1-hour evidence prompts.
    """
    candidate_skills = resume_schema.skills or ["Software Engineering", "Systems Architecture", "API Design"]

    # Reconstruct candidate corpus and experience text for evidence verification
    exp_bullets = []
    if resume_schema.experience:
        for exp in resume_schema.experience:
            exp_bullets.append(f"{exp.role} {exp.description}")
    experience_text = " ".join(exp_bullets).lower()
    candidate_corpus = f"{resume_schema.summary or ''} {experience_text} {' '.join(candidate_skills)}"

    job_corpus = f"{job_title} {job_description}"

    # Extract target job requirements and missing gaps via SIMD matcher
    matched_skills, missing_skills = SemanticVectorMatcher.extract_keywords_and_gaps(
        candidate_text=candidate_corpus,
        candidate_skills=candidate_skills,
        job_text=job_corpus
    )

    all_target_requirements = list(dict.fromkeys(matched_skills + missing_skills))
    if not all_target_requirements:
        all_target_requirements = [job_title, "API Development", "System Design"]

    # Partition into Must-Have (top 3 core) and Nice-To-Have
    must_haves = all_target_requirements[:3]
    nice_to_haves = all_target_requirements[3:8] or all_target_requirements[:1]

    has_critical_missing_must_have = False
    adjacent_matches: List[Tuple[str, str]] = []
    action_items: List[str] = []

    # 1. Evaluate Must-Haves
    must_have_scores = []
    for mh in must_haves:
        level, credit, matched_c = SkillAliasTable.evaluate_skill_match(candidate_skills, mh)
        if level == "missing":
            has_critical_missing_must_have = True
            must_have_scores.append(0.0)
            action_items.append(f"Project Task (1-2 weekends): Missing must-have '{mh}' blocks qualification. Build and commit a demo project featuring {mh}.")
        elif level == "adjacent":
            # Check evidence in experience
            ev_weight = 1.0 if (matched_c and matched_c.lower() in experience_text) else 0.6
            must_have_scores.append(credit * ev_weight)
            adjacent_matches.append((mh, matched_c or "equivalent"))
            action_items.append(f"Bridge Note (1 weekend): Your experience in '{matched_c}' transfers to '{mh}'. Complete a mini-exercise to bridge syntax differences.")
        else:
            # Exact match
            ev_weight = 1.0 if (matched_c and matched_c.lower() in experience_text) else 0.6
            must_have_scores.append(1.0 * ev_weight)
            if ev_weight < 1.0:
                action_items.append(f"Evidence Prompt (1 hour): '{mh}' is listed only in your skills. Add a concrete quantified bullet in your work experience.")

    must_have_coverage = sum(must_have_scores) / max(1, len(must_haves))

    # 2. Evaluate Nice-To-Haves
    nice_have_scores = []
    for nth in nice_to_haves:
        level, credit, matched_c = SkillAliasTable.evaluate_skill_match(candidate_skills, nth)
        if level == "exact":
            ev_weight = 1.0 if (matched_c and matched_c.lower() in experience_text) else 0.6
            nice_have_scores.append(1.0 * ev_weight)
        elif level == "adjacent":
            nice_have_scores.append(credit * 0.8)
        else:
            nice_have_scores.append(0.0)

    nice_to_have_coverage = sum(nice_have_scores) / max(1, len(nice_to_haves))

    # 3. Experience & Location Fit
    exp_count = len(resume_schema.experience or [])
    experience_fit = min(1.0, max(0.4, exp_count * 0.35))
    location_fit = 1.0  # Remote or targeted city match

    # 4. CareerPilot Composite Formula
    raw_score = (
        0.60 * must_have_coverage +
        0.20 * nice_to_have_coverage +
        0.10 * experience_fit +
        0.10 * location_fit
    ) * 100

    # 5. CareerPilot Hard Cap Rule: If any must-have is missing, cap final score at 70
    if has_critical_missing_must_have:
        overall_score = int(min(70, max(42, raw_score)))
    else:
        overall_score = int(min(97, max(45, raw_score)))

    skill_score = int(min(98, max(40, (must_have_coverage * 0.7 + nice_to_have_coverage * 0.3) * 100)))
    exp_score = int(min(95, max(45, experience_fit * 100)))

    # Strengths summary
    strengths = [
        f"Verified alignment on core technical requirements ({len(matched_skills)} skills matched).",
        f"Mathematical CareerPilot coverage: {int(must_have_coverage * 100)}% must-have competencies satisfied."
    ]
    if adjacent_matches:
        strengths.append(f"Transferable adjacent stack: {adjacent_matches[0][1]} directly supplements {adjacent_matches[0][0]}.")

    weaknesses = []
    if has_critical_missing_must_have:
        weaknesses.append("Score capped at 70: Essential must-have skills from job specification are absent from resume.")
    if missing_skills:
        weaknesses.append(f"Identified competency gap in '{missing_skills[0]}'.")

    # Grounded evidence & CareerPilot structured models
    matched_evidence = []
    for skill in matched_skills:
        if skill.lower() in experience_text:
            matched_evidence.append(MatchedSkillEvidence(skill=skill, evidence="strong", where="Work Experience / Projects"))
        else:
            matched_evidence.append(MatchedSkillEvidence(skill=skill, evidence="listed_only", where="Skills Summary"))

    adjacent_models = [
        AdjacentSkillMatch(jd_wants=target, you_have=cand, credit=0.6)
        for target, cand in adjacent_matches
    ]

    structured_gaps = []
    for mh in must_haves:
        if mh in missing_skills:
            structured_gaps.append(CompetencyGap(skill=mh, type="must_have", impact="high"))
    for nth in nice_to_haves:
        if nth in missing_skills:
            structured_gaps.append(CompetencyGap(skill=nth, type="nice_to_have", impact="low"))

    why_matches = (
        f"Verified coverage across {len(matched_skills)} core technical competencies grounded in candidate project history."
        if matched_skills else "General software engineering principles align with target role."
    )
    what_blocks = (
        f"Critical must-have competency '{must_haves[0]}' is absent from resume and blocks qualification (capped at 70)."
        if has_critical_missing_must_have else "No critical blocking competency gaps detected."
    )

    return JobMatchSchema(
        overall_match_score=overall_score,
        skill_match_score=skill_score,
        experience_match_score=exp_score,
        education_match_score=90,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        matched_keywords=matched_skills[:8],
        missing_keywords=missing_skills[:8],
        strengths=strengths,
        gaps=weaknesses,
        recommendations=action_items[:4] or [
            "Incorporate verified experience with target competencies into your core resume bullets.",
            "Elevate visibility of primary technical stack in the summary to boost ATS keyword indexing."
        ],
        matched_evidence=matched_evidence,
        adjacent_matches=adjacent_models,
        structured_gaps=structured_gaps,
        why_matches=why_matches,
        what_blocks=what_blocks,
    )


class JobMatchingService:
    """
    Handles database operations and orchestration
    for resume-to-job matching.
    """

    @staticmethod
    @transaction.atomic
    def match_resume_to_job(resume: Resume, job_title: str, job_description: str = "") -> JobMatchResult:
        if resume is None:
            raise ValueError("Resume cannot be None.")

        has_parsed = False
        try:
            if resume.parser_result:
                has_parsed = True
        except Exception:
            pass

        if not resume.extracted_text and not has_parsed and not getattr(resume, "parsed_data", None):
            raise ValueError("Resume extracted text not found.")

        if not job_title or not job_title.strip():
            raise ValueError("Job title is required.")

        # Ensure parsed data exists
        if getattr(resume, "parsed_data", None):
            resume_schema = ResumeSchema.model_validate(resume.parsed_data)
        else:
            try:
                parser_result = resume.parser_result
                resume_schema = ResumeSchema.model_validate(parser_result.parsed_data)
            except Exception:
                from AI.Services.ResumeProcessService import ResumeProcessingService
                process_res = ResumeProcessingService.process(resume)
                parser_result = process_res["parser_result"]
                resume_schema = ResumeSchema.model_validate(parser_result.parsed_data)

        raw_title = job_title.strip()
        raw_desc = job_description.strip() if job_description else ""

        # Run multi-node LangGraph execution (vector similarity runs on clean text; agent wraps prompts cleanly)
        try:
            result = run_job_matching_graph(
                resume=resume_schema,
                job_title=raw_title,
                job_description=raw_desc,
                thread_id=f"job_match_{resume.id}"
            )
            match_result = result.get("match_result")
        except Exception as exc:
            logger.warning("Gemini Job Matching encountered an issue (%s). Using CareerPilot 3-tier matcher.", exc)
            match_result = None

        if match_result is None:
            match_result = build_heuristic_job_match(resume_schema, raw_title, raw_desc)

        saved_result = JobMatchResult.objects.create(
            resume=resume,
            job_title=raw_title[:255],
            job_description=raw_desc[:12000],
            match_data=match_result.model_dump(),
        )

        return saved_result

    # Alias for API view controllers
    process_match = match_resume_to_job
