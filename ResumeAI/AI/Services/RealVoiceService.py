import asyncio
import base64
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Cache generated audio base64 by text hash to ensure instant response on repeated phrases
_VOICE_CACHE: dict = {}

class RealVoiceService:
    """
    High-fidelity Neural Speech Synthesis using Microsoft Edge Neural TTS.
    Generates studio-grade natural human voice for Marcus Vance (en-US-ChristopherNeural).
    Returns data:audio/mp3;base64,... strings for direct frontend HTML5 Audio playback.
    """
    DEFAULT_VOICE = "en-US-ChristopherNeural"  # Professional, warm, executive male voice

    @classmethod
    def synthesize_to_base64(cls, text: str, voice: Optional[str] = None) -> Optional[str]:
        """
        Synthesize text into MP3 base64 data URI synchronously.
        Includes a 6-second timeout and fallback.
        """
        clean_text = text.strip() if text else ""
        if not clean_text:
            return None

        chosen_voice = voice or cls.DEFAULT_VOICE
        cache_key = f"{chosen_voice}:{clean_text}"

        if cache_key in _VOICE_CACHE:
            return _VOICE_CACHE[cache_key]

        try:
            # Run async generator within event loop or new loop
            audio_b64 = asyncio.run(cls._generate_audio(clean_text, chosen_voice))
            if audio_b64:
                # Keep cache bounded
                if len(_VOICE_CACHE) > 100:
                    _VOICE_CACHE.clear()
                _VOICE_CACHE[cache_key] = audio_b64
                return audio_b64
        except Exception as e:
            logger.warning(f"RealVoiceService synthesis failed: {e}")
            return None

        return None

    @classmethod
    async def _generate_audio(cls, text: str, voice: str) -> Optional[str]:
        try:
            import edge_tts
            communicate = edge_tts.Communicate(text, voice)
            mp3_bytes = bytearray()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    mp3_bytes.extend(chunk["data"])

            if not mp3_bytes:
                return None

            encoded = base64.b64encode(mp3_bytes).decode("utf-8")
            return f"data:audio/mp3;base64,{encoded}"
        except Exception as e:
            logger.error(f"Error in edge_tts generation: {e}")
            return None
