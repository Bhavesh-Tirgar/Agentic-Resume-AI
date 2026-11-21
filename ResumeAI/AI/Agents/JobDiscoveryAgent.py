import logging
from typing import Optional
from langchain_core.prompts import ChatPromptTemplate
from AI.Services.GeminiService import GeminiService
from AI.Utils.TokenCounter import TokenCounter
from AI.Schemas.ResumeSchema import ResumeSchema
from AI.Schemas.JobDiscoverySchema import JobDiscoveryResponseSchema
from AI.Prompts.JobDiscoveryPrompt import JOB_DISCOVERY_PROMPT

logger = logging.getLogger(__name__)


class JobDiscoveryAgent:
    """
    AI Agent that discovers, analyzes, and ranks realistic technical
    jobs near the candidate's location based on their parsed resume profile.
    """

    def __init__(self):
        self.gemini_service = GeminiService()
        self.llm = self.gemini_service.get_structured_llm(JobDiscoveryResponseSchema)
        self.prompt = ChatPromptTemplate.from_messages(
            [
                ("system", JOB_DISCOVERY_PROMPT),
                (
                    "human",
                    """
                    Discover active, realistic technical jobs tailored for this candidate:
                    
                    Candidate Location: {location}
                    Work Preference: {work_type}
                    
                    Structured Resume:
                    {resume}
                    """
                ),
            ]
        )
        self.chain = self.prompt | self.llm

    def run(
        self,
        resume: ResumeSchema,
        location: str = "Ahmedabad, India",
        work_type: str = "All"
    ) -> JobDiscoveryResponseSchema:
        if resume is None:
            raise ValueError("Resume cannot be None.")

        token_counter = TokenCounter(agent_name="JobDiscoveryAgent")
        try:
            result = self.chain.invoke(
                {
                    "location": location,
                    "work_type": work_type,
                    "resume": resume.model_dump_json(indent=2),
                }
            )
            return result
        except Exception as exc:
            logger.warning("JobDiscoveryAgent invocation failed: %s", exc)
            raise
