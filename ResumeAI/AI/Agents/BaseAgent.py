from abc import ABC, abstractmethod
from AI.Services.GeminiService import GeminiService
from AI.Utils.PIIScrubber import PIIScrubber
from AI.Utils.PromptInjectionGuardrail import PromptInjectionGuardrail


class BaseAgent(ABC):
    """
    Shared architectural base class for all LangChain AI agents.
    Provides centralized Gemini client configuration, PII-safe resume serialization,
    and untrusted prompt wrapping helpers.
    """

    def __init__(self):
        self.gemini_service = GeminiService()

    def get_structured_llm(self, schema):
        return self.gemini_service.get_structured_llm(schema)

    @staticmethod
    def redact_resume_for_llm(resume) -> str:
        """
        Serializes a ResumeSchema with contact PII masked before external LLM dispatch.
        """
        sanitized = resume.model_copy(deep=True)
        if hasattr(sanitized, "email"):
            sanitized.email = None
        if hasattr(sanitized, "phone"):
            sanitized.phone = ""
        raw_json = sanitized.model_dump_json(indent=2)
        scrubbed_json, _ = PIIScrubber.redact(raw_json)
        return PromptInjectionGuardrail.sanitize_untrusted_text(scrubbed_json)

    @abstractmethod
    def run(self, *args, **kwargs):
        """Execute the agent."""
        raise NotImplementedError
