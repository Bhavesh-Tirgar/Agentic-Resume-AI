import logging

from langchain_core.prompts import ChatPromptTemplate
from AI.Agents.BaseAgent import BaseAgent
from AI.Utils.TokenCounter import TokenCounter
from AI.Utils.PromptInjectionGuardrail import PromptInjectionGuardrail
from AI.Schemas.ResumeSchema import ResumeSchema
from AI.Schemas.JobMatchSchema import JobMatchSchema
from AI.Prompts.JobMatchingPrompt import JOB_MATCHING_PROMPT

logger = logging.getLogger(__name__)


class JobMatchingAgent(BaseAgent):
    """
    Compares a PII-scrubbed structured resume against a nonce-wrapped job description
    and produces a validated CareerPilot JobMatchSchema result.
    """

    def __init__(self):
        super().__init__()
        self.llm = self.get_structured_llm(JobMatchSchema)
        self.prompt = ChatPromptTemplate.from_messages(
            [
                ("system", JOB_MATCHING_PROMPT),
                (
                    "human",
                    """
                    Analyze the candidate against the supplied job description.

                    Candidate Resume (JSON):
                    {resume}

                    Target Job Title:
                    {job_title}

                    Job Description:
                    {job_description}
                    """
                ),
            ]
        )
        self.chain = self.prompt | self.llm

    def run(self, resume: ResumeSchema, job_title: str, job_description: str = "") -> JobMatchSchema:
        if resume is None:
            raise ValueError("Resume cannot be None.")

        if not job_title or not job_title.strip():
            raise ValueError("Job title cannot be empty.")

        try:
            token_counter = TokenCounter(agent_name="JobMatchingAgent")
            scrubbed_resume_json = self.redact_resume_for_llm(resume)
            wrapped_title = PromptInjectionGuardrail.wrap_delimited_corpus(
                job_title.strip(),
                tag_name="untrusted_job_title",
            )
            wrapped_desc = PromptInjectionGuardrail.wrap_delimited_corpus(
                job_description.strip() if job_description else "",
                tag_name="untrusted_job_description",
            )

            result = self.chain.invoke(
                {
                    "resume": scrubbed_resume_json,
                    "job_title": wrapped_title,
                    "job_description": wrapped_desc,
                },
                config={"callbacks": [token_counter]},
            )
            return result

        except Exception as exc:
            logger.exception("Job matching failed.")
            raise RuntimeError("Failed to generate job matching result.") from exc
