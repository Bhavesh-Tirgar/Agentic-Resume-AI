from langchain_core.prompts import ChatPromptTemplate
from AI.Utils.TokenCounter import TokenCounter
from AI.Utils.PIIScrubber import PIIScrubber
from AI.Utils.PromptInjectionGuardrail import PromptInjectionGuardrail
from AI.Services.GeminiService import GeminiService
from AI.Prompts.ResumeParserPrompt import RESUME_PARSER_PROMPT
from AI.Schemas.ResumeSchema import ResumeSchema


class ResumeParserAgent:
    """
    LangChain-based AI agent responsible for converting
    raw resume text into structured ResumeSchema data.
    """

    def __init__(self):

        # Get the centralized Gemini service
        self.gemini_service = GeminiService()

        # Configure Gemini to return ResumeSchema directly
        self.llm = self.gemini_service.get_structured_llm(ResumeSchema)

        # Build LangChain prompt
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    RESUME_PARSER_PROMPT
                ),
                (
                    "human",
                    """
                    Parse the following resume text.

                    Resume Text:
                    {resume_text}
                    """
                )
            ]
        )

        # Create LangChain runnable chain
        self.chain = self.prompt | self.llm

    def run(self, resume_text: str) -> ResumeSchema:
        """
        Parse raw resume text and return a validated
        ResumeSchema object.
        """
        token_counter = TokenCounter(agent_name="ResumeParserAgent")

        result = self.chain.invoke(
            {
                "resume_text": PromptInjectionGuardrail.wrap_delimited_corpus(PIIScrubber.redact(resume_text)[0], tag_name="untrusted_candidate_resume")
            },
            config={
                    "callbacks": [token_counter]
                    }
        )

        import re
        if result.email and "[REDACTED_EMAIL" in result.email:
            em = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", resume_text)
            if em:
                result.email = em.group(0)

        return result