import re
from langchain_core.prompts import ChatPromptTemplate
from AI.Agents.BaseAgent import BaseAgent
from AI.Utils.TokenCounter import TokenCounter
from AI.Utils.PIIScrubber import PIIScrubber
from AI.Utils.PromptInjectionGuardrail import PromptInjectionGuardrail
from AI.Prompts.ResumeParserPrompt import RESUME_PARSER_PROMPT
from AI.Schemas.ResumeSchema import ResumeSchema


class ResumeParserAgent(BaseAgent):
    """
    LangChain-based AI agent responsible for converting
    raw resume text into structured ResumeSchema data.
    """

    def __init__(self):
        super().__init__()
        self.llm = self.get_structured_llm(ResumeSchema)
        self.prompt = ChatPromptTemplate.from_messages(
            [
                ("system", RESUME_PARSER_PROMPT),
                (
                    "human",
                    """
                    Parse the following resume text.

                    Resume Text:
                    {resume_text}
                    """
                ),
            ]
        )
        self.chain = self.prompt | self.llm

    def run(self, resume_text: str) -> ResumeSchema:
        """
        Parse raw resume text with PII scrubbing and nonced prompt injection wrapping,
        then restore contact PII locally.
        """
        token_counter = TokenCounter(agent_name="ResumeParserAgent")
        scrubbed_text, vault = PIIScrubber.redact(resume_text)

        result = self.chain.invoke(
            {
                "resume_text": PromptInjectionGuardrail.wrap_delimited_corpus(
                    scrubbed_text,
                    tag_name="untrusted_candidate_resume",
                )
            },
            config={"callbacks": [token_counter]},
        )

        PIIScrubber.restore_recursive(result, vault)
        if result.email and "[REDACTED_EMAIL" in result.email:
            em = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", resume_text)
            if em:
                result.email = em.group(0)

        return result
