from typing import TypedDict

from langgraph.graph import StateGraph, START, END

from AI.Agents.ResumeParserAgent import ResumeParserAgent
from AI.Agents.ResumeAnalysisAgent import ResumeAnalysisAgent
from AI.Agents.ResumeScoringAgent import ResumeScoringAgent

from AI.Schemas.ResumeSchema import ResumeSchema
from AI.Schemas.AnalysisSchema import AnalysisSchema
from AI.Schemas.ResumeScoreSchema import ResumeScoreSchema


class ResumeState(TypedDict, total=False):
    resume_text: str
    parsed_resume: ResumeSchema
    analysis: AnalysisSchema
    score: ResumeScoreSchema
    retry_count: int
    validation_passed: bool
    validation_error: str
    error: str


def parse_resume_node(state: ResumeState) -> dict:
    parser = ResumeParserAgent()
    parsed_resume = parser.run(state["resume_text"])
    return {
        "parsed_resume": parsed_resume,
        "retry_count": state.get("retry_count", 0),
    }


def validate_parse_node(state: ResumeState) -> dict:
    """
    Agentic Reflection Node: Validates that the parsed resume meets minimum
    extraction quality (skills and either experience or summary).
    """
    parsed = state.get("parsed_resume")
    if not parsed:
        return {"validation_passed": False, "validation_error": "Parsed resume is empty."}

    has_skills = bool(parsed.skills and len(parsed.skills) > 0)
    has_summary = bool(parsed.summary and len(parsed.summary.strip()) > 10)
    has_exp = bool(parsed.experience and len(parsed.experience) > 0)

    if has_skills and (has_summary or has_exp):
        return {"validation_passed": True, "validation_error": ""}

    return {
        "validation_passed": False,
        "validation_error": "Sparse parsing detected: missing skills or work experience.",
    }


def should_refine_parse(state: ResumeState) -> str:
    """
    Conditional edge: routes to self-correction node if validation failed and under max retries.
    """
    if state.get("validation_passed", False):
        return "analyze_resume"

    if state.get("retry_count", 0) < 1:
        return "refine_parse"

    return "analyze_resume"


def refine_parse_node(state: ResumeState) -> dict:
    """
    Agentic Self-Correction Node: Re-prompts parser with focused extraction
    instructions when initial extraction was sparse.
    """
    retry = state.get("retry_count", 0) + 1
    enhanced_text = (
        f"{state.get('resume_text', '')}\n\n"
        "[CRITICAL AGENT INSTRUCTION: Prior parsing was sparse. Exhaustively extract all skills, "
        "technologies, certifications, and experience roles from the above document.]"
    )
    parser = ResumeParserAgent()
    re_parsed = parser.run(enhanced_text)
    return {
        "parsed_resume": re_parsed,
        "retry_count": retry,
    }


def analyze_resume_node(state: ResumeState) -> dict:
    resume = state["parsed_resume"]
    analyzer = ResumeAnalysisAgent()
    analysis = analyzer.run(resume)
    return {
        "analysis": analysis
    }


def score_resume_node(state: ResumeState) -> dict:
    resume = state["parsed_resume"]
    analysis = state["analysis"]
    scorer = ResumeScoringAgent()
    score = scorer.run(resume, analysis)
    return {
        "score": score
    }


def build_resume_graph():
    graph = StateGraph(ResumeState)

    # Nodes
    graph.add_node("parse_resume", parse_resume_node)
    graph.add_node("validate_parse", validate_parse_node)
    graph.add_node("refine_parse", refine_parse_node)
    graph.add_node("analyze_resume", analyze_resume_node)
    graph.add_node("score_resume", score_resume_node)

    # Edges & Cyclic Routing
    graph.add_edge(START, "parse_resume")
    graph.add_edge("parse_resume", "validate_parse")
    graph.add_conditional_edges(
        "validate_parse",
        should_refine_parse,
        {
            "refine_parse": "refine_parse",
            "analyze_resume": "analyze_resume",
        }
    )
    graph.add_edge("refine_parse", "validate_parse")
    graph.add_edge("analyze_resume", "score_resume")
    graph.add_edge("score_resume", END)

    return graph.compile()


# Compile once when the module loads
resume_graph = build_resume_graph()


def run_resume_graph(resume_text: str):
    return resume_graph.invoke(
        {
            "resume_text": resume_text,
            "retry_count": 0,
        }
    )
