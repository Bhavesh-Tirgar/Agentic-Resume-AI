import logging
from typing import Dict, Any
from langchain_core.callbacks import BaseCallbackHandler

logger = logging.getLogger(__name__)


class TokenCounter(BaseCallbackHandler):
    """
    Structured telemetry callback for tracking Gemini LLM token consumption.
    Emits single-line machine-parseable log records for production observability.
    """

    def __init__(self, agent_name: str = "UnknownAgent"):
        super().__init__()
        self.agent_name = agent_name
        self.prompt_tokens: int = 0
        self.output_tokens: int = 0
        self.total_tokens: int = 0

    def on_llm_end(self, response, **kwargs):
        try:
            generations = getattr(response, "generations", None)
            if not generations or not generations[0]:
                return

            message = getattr(generations[0][0], "message", None)
            usage = getattr(message, "usage_metadata", {}) or {}

            self.prompt_tokens = usage.get("input_tokens", 0)
            self.output_tokens = usage.get("output_tokens", 0)
            self.total_tokens = usage.get("total_tokens", 0)

            logger.info(
                "LLM Telemetry: agent='%s' prompt_tokens=%d output_tokens=%d total_tokens=%d",
                self.agent_name,
                self.prompt_tokens,
                self.output_tokens,
                self.total_tokens,
            )
        except Exception as e:
            logger.debug("Failed to record token usage: %s", e)

    def get_summary(self) -> Dict[str, Any]:
        return {
            "agent": self.agent_name,
            "prompt_tokens": self.prompt_tokens,
            "output_tokens": self.output_tokens,
            "total_tokens": self.total_tokens,
        }
