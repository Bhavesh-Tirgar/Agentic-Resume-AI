import logging
import time
from langchain_core.prompts import ChatPromptTemplate
from AI.Services.GeminiService import GeminiService
from AI.Schemas.UnifiedDossierSchema import UnifiedDossierSchema
from AI.Prompts.UnifiedDossierPrompt import UNIFIED_DOSSIER_PROMPT
from AI.Utils.TokenCounter import TokenCounter
from AI.Utils.PIIScrubber import PIIScrubber
from AI.Utils.PromptInjectionGuardrail import PromptInjectionGuardrail

logger = logging.getLogger(__name__)


class UnifiedDossierService:
    """
    High-Performance Unified Dossier Synthesis Service.
    Consolidates parsing, ATS diagnostic scoring, and bullet calibration
    into a single structured Gemini round trip with cryptographically nonced
    prompt injection defense and recursive PII vault restoration.
    """

    def __init__(self):
        self.gemini_service = GeminiService()
        self.llm = self.gemini_service.get_structured_llm(UnifiedDossierSchema)

        self.prompt = ChatPromptTemplate.from_messages(
            [
                ("system", UNIFIED_DOSSIER_PROMPT),
                (
                    "human",
                    """
                    Analyze and synthesize the following candidate resume:

                    {wrapped_resume}
                    """
                ),
            ]
        )

        self.chain = self.prompt | self.llm

    def synthesize(self, raw_text: str) -> dict:
        """
        Executes single-shot parsing, scoring, and calibration.
        Returns a dict containing the parsed schema, latency, and token metrics.
        """
        if not raw_text or not raw_text.strip():
            raise ValueError("Resume raw text cannot be empty.")

        # Cap length at 12,000 characters to prevent token exhaustion and rate limits
        sanitized_len = raw_text.strip()[:12000]

        # India DPDP / Privacy Guardrail: scrub sensitive PII and enforce cryptographic nonce boundary
        scrubbed_text, pii_vault = PIIScrubber.redact(sanitized_len)
        wrapped_resume = PromptInjectionGuardrail.wrap_delimited_corpus(
            scrubbed_text,
            tag_name="untrusted_candidate_resume",
        )

        start_time = time.time()
        token_counter = TokenCounter(agent_name="UnifiedDossierSynthesis")

        try:
            dossier: UnifiedDossierSchema = self.chain.invoke(
                {"wrapped_resume": wrapped_resume},
                config={"callbacks": [token_counter]}
            )

            # Recursively restore any redacted PII tokens echoed anywhere inside nested dossier fields
            PIIScrubber.restore_recursive(dossier, pii_vault)

            elapsed_time = round(time.time() - start_time, 2)
            logger.info("Unified dossier synthesized in %ss (PII vault & nonce guardrail protected)", elapsed_time)

            return {
                "dossier": dossier,
                "latency_seconds": elapsed_time,
                "token_usage": token_counter.get_summary() if hasattr(token_counter, "get_summary") else None
            }
        except Exception as exc:
            logger.exception("Unified dossier synthesis failed: %s", exc)
            raise RuntimeError(f"Failed to synthesize unified dossier: {str(exc)}") from exc
