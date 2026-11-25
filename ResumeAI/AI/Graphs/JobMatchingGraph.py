from typing import TypedDict, List

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from AI.Agents.JobMatchingAgent import JobMatchingAgent
from AI.Schemas.ResumeSchema import ResumeSchema
from AI.Schemas.JobMatchSchema import JobMatchSchema
from AI.Utils.SemanticVectorMatcher import SemanticVectorMatcher


class JobMatchingState(TypedDict, total=False):
    resume: ResumeSchema
    job_title: str
    job_description: str
    vector_cosine: float
    vector_matched: List[str]
    vector_gaps: List[str]
    match_result: JobMatchSchema
    error: str


def compute_vector_similarity_node(state: JobMatchingState) -> dict:
    """
    Agentic Pre-Computation Node: Computes mathematical cosine vector similarity
    and extracts true missing keywords before calling the LLM.
    """
    resume = state["resume"]
    job_title = state["job_title"]
    job_description = state.get("job_description", "")

    candidate_skills = resume.skills or []
    candidate_corpus = f"{resume.summary} {' '.join(candidate_skills)}"
    if resume.experience:
        for exp in resume.experience:
            candidate_corpus += f" {exp.role} {exp.description}"

    job_corpus = f"{job_title} {job_description}"

    cosine_sim = SemanticVectorMatcher.cosine_similarity(candidate_corpus, job_corpus)
    matched, gaps = SemanticVectorMatcher.extract_keywords_and_gaps(
        candidate_text=candidate_corpus,
        candidate_skills=candidate_skills,
        job_text=job_corpus,
    )

    return {
        "vector_cosine": cosine_sim,
        "vector_matched": matched,
        "vector_gaps": gaps,
    }


def match_job_node(state: JobMatchingState) -> dict:
    """
    LLM Evaluation Node: Executes deep qualitative matching via Gemini.
    """
    agent = JobMatchingAgent()

    result = agent.run(
        resume=state["resume"],
        job_title=state["job_title"],
        job_description=state.get("job_description", ""),
    )

    return {"match_result": result}


def calibrate_match_node(state: JobMatchingState) -> dict:
    """
    Reconciliation Node: Anchors the LLM's qualitative assessment to empirical
    cosine similarity and enforces the CareerPilot Max-70 Hard Cap deterministically.
    """
    result = state["match_result"]
    cosine_sim = float(state.get("vector_cosine", 0.5))
    vector_gaps = state.get("vector_gaps", [])
    vector_matched = state.get("vector_matched", [])

    # Backfill missing skills if LLM omitted obvious vector gaps
    if not result.missing_skills and vector_gaps:
        result.missing_skills = vector_gaps[:5]

    # Check empirical missing must-haves or severe vector mismatch
    has_missing_must_have = any(
        getattr(g, "type", None) == "must_have"
        for g in (result.structured_gaps or [])
    )
    if not result.structured_gaps and len(result.missing_skills or []) > 0 and cosine_sim < 0.72:
        has_missing_must_have = True

    # Enforce CareerPilot Hard Cap Rule: max 70 when critical must-have gaps block qualification
    if has_missing_must_have and result.overall_match_score > 70:
        result.overall_match_score = 70
        cap_note = "Capped at 70 per CareerPilot Hard Cap Rule due to missing must-have requirements."
        if cap_note not in (result.gaps or []):
            result.gaps = [cap_note] + list(result.gaps or [])
        if not result.what_blocks or "capped at 70" not in result.what_blocks.lower():
            blocking_skill = next(
                (g.skill for g in (result.structured_gaps or []) if g.type == "must_have"),
                (result.missing_skills[0] if result.missing_skills else "core must-have skill"),
            )
            result.what_blocks = f"Capped at 70: missing must-have competency '{blocking_skill}' blocks full qualification."

    # Anchor runaway high scores when empirical TF-IDF vector overlap is near zero
    if cosine_sim < 0.12 and not vector_matched and result.overall_match_score > 65:
        result.overall_match_score = min(result.overall_match_score, int(round(45 + cosine_sim * 100)))

    return {"match_result": result}


job_matching_checkpointer = MemorySaver()


def build_job_matching_graph():
    graph = StateGraph(JobMatchingState)

    # Multi-node hybrid vector pipeline
    graph.add_node("compute_vector_similarity", compute_vector_similarity_node)
    graph.add_node("match_job", match_job_node)
    graph.add_node("calibrate_match", calibrate_match_node)

    graph.add_edge(START, "compute_vector_similarity")
    graph.add_edge("compute_vector_similarity", "match_job")
    graph.add_edge("match_job", "calibrate_match")
    graph.add_edge("calibrate_match", END)

    return graph.compile(checkpointer=job_matching_checkpointer)


job_matching_graph = build_job_matching_graph()


def run_job_matching_graph(
    resume: ResumeSchema,
    job_title: str,
    job_description: str = "",
    thread_id: str = "default",
):
    return job_matching_graph.invoke(
        {
            "resume": resume,
            "job_title": job_title,
            "job_description": job_description,
        },
        config={"configurable": {"thread_id": thread_id or "default"}}
    )
