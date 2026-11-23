from typing import TypedDict, List

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from AI.Agents.InterviewPlannerAgent import InterviewPlannerAgent
from AI.Schemas.ResumeSchema import ResumeSchema
from AI.Schemas.AnalysisSchema import AnalysisSchema
from AI.Schemas.ResumeScoreSchema import ResumeScoreSchema
from AI.Schemas.JobMatchSchema import JobMatchSchema
from AI.Schemas.InterviewPlanSchema import InterviewPlanSchema


class InterviewPlanningState(TypedDict, total=False):
    resume: ResumeSchema
    analysis: AnalysisSchema
    score: ResumeScoreSchema
    job_match: JobMatchSchema
    job_title: str
    job_description: str
    calibrated_seniority: str
    interview_plan: InterviewPlanSchema
    error: str


def calibrate_scope_node(state: InterviewPlanningState) -> dict:
    """
    Agentic Pre-Calibration Node: Evaluates candidate experience length and role seniority
    to guide interview depth (Junior, Mid-Level, or Staff/Architect).
    """
    resume = state["resume"]
    exp_count = len(resume.experience) if resume.experience else 0

    if exp_count == 0:
        seniority = "Junior / Entry-Level"
    elif exp_count <= 2:
        seniority = "Intermediate"
    else:
        seniority = "Senior / Lead"

    return {"calibrated_seniority": seniority}


def plan_interview_node(state: InterviewPlanningState) -> dict:
    """
    Core Planning Agent Node: Synthesizes structured rounds and questions via Gemini.
    """
    agent = InterviewPlannerAgent()

    result = agent.run(
        resume=state["resume"],
        analysis=state["analysis"],
        score=state["score"],
        job_match=state["job_match"],
        job_title=state["job_title"],
        job_description=state.get("job_description", ""),
    )

    return {"interview_plan": result}


def validate_and_enrich_plan_node(state: InterviewPlanningState) -> dict:
    """
    Validation & Enrichment Node: Ensures rounds meet enterprise standard
    and verifies STAR questions have valid objectives.
    """
    plan = state["interview_plan"]

    # Ensure focus areas are populated
    if not plan.focus_areas and state.get("job_match"):
        plan.focus_areas = state["job_match"].matched_skills[:4] or ["Core Competencies"]

    return {"interview_plan": plan}


interview_planning_checkpointer = MemorySaver()


def build_interview_planning_graph():
    graph = StateGraph(InterviewPlanningState)

    # Multi-node pipeline
    graph.add_node("calibrate_scope", calibrate_scope_node)
    graph.add_node("plan_interview", plan_interview_node)
    graph.add_node("validate_and_enrich_plan", validate_and_enrich_plan_node)

    graph.add_edge(START, "calibrate_scope")
    graph.add_edge("calibrate_scope", "plan_interview")
    graph.add_edge("plan_interview", "validate_and_enrich_plan")
    graph.add_edge("validate_and_enrich_plan", END)

    return graph.compile(checkpointer=interview_planning_checkpointer)


interview_planning_graph = build_interview_planning_graph()


def run_interview_planning_graph(
    resume: ResumeSchema,
    analysis: AnalysisSchema,
    score: ResumeScoreSchema,
    job_match: JobMatchSchema,
    job_title: str,
    job_description: str = "",
    thread_id: str = "default",
):
    return interview_planning_graph.invoke(
        {
            "resume": resume,
            "analysis": analysis,
            "score": score,
            "job_match": job_match,
            "job_title": job_title,
            "job_description": job_description,
        },
        config={"configurable": {"thread_id": thread_id or "default"}}
    )
