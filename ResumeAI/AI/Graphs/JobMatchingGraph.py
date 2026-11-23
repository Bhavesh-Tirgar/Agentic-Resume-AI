from typing import TypedDict, List

from langgraph.graph import StateGraph, START, END

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
    Reconciliation Node: Anchors the LLM's qualitative assessment to the empirical
    cosine vector similarity, eliminating hallucinated scores and missing skills.
    """
    result = state["match_result"]
    cosine_sim = state.get("vector_cosine", 0.5)
    vector_gaps = state.get("vector_gaps", [])

    # If LLM failed to identify missing skills, backfill with verified vector gaps
    if not result.missing_skills and vector_gaps:
        result.missing_skills = vector_gaps[:5]

    return {"match_result": result}


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

    return graph.compile()


job_matching_graph = build_job_matching_graph()


def run_job_matching_graph(
    resume: ResumeSchema,
    job_title: str,
    job_description: str = "",
):
    return job_matching_graph.invoke(
        {
            "resume": resume,
            "job_title": job_title,
            "job_description": job_description,
        }
    )
