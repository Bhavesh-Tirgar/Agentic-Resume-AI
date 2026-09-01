from typing import TypedDict

from langgraph.graph import StateGraph, START, END

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

    interview_plan: InterviewPlanSchema

    error: str


def plan_interview_node(state: InterviewPlanningState) -> dict:

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


def build_interview_planning_graph():

    graph = StateGraph(InterviewPlanningState)

    # Node
    graph.add_node("plan_interview", plan_interview_node)

    # Edges
    graph.add_edge(START, "plan_interview")

    graph.add_edge("plan_interview", END)

    return graph.compile()


# Compile once when module loads
interview_planning_graph = (build_interview_planning_graph())


def run_interview_planning_graph(resume: ResumeSchema,analysis: AnalysisSchema,score: ResumeScoreSchema,job_match: JobMatchSchema,job_title: str,job_description: str = "",):

    return interview_planning_graph.invoke(
        {
            "resume": resume,

            "analysis": analysis,

            "score": score,

            "job_match": job_match,

            "job_title": job_title,

            "job_description": job_description,
        }
    )