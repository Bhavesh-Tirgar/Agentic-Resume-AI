import asyncio
import base64
import collections
import concurrent.futures
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# LRU Cache generated audio base64 by text hash to ensure instant response on repeated phrases
# Max 200 items, pops oldest when capacity is exceeded
_VOICE_CACHE: collections.OrderedDict = collections.OrderedDict()
_VOICE_CACHE_LIMIT = 200


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
        Includes LRU cache and safe execution across active or inactive event loops.
        """
        clean_text = text.strip() if text else ""
        if not clean_text:
            return None

        chosen_voice = voice or cls.DEFAULT_VOICE
        cache_key = f"{chosen_voice}:{clean_text}"

        if cache_key in _VOICE_CACHE:
            _VOICE_CACHE.move_to_end(cache_key)
            return _VOICE_CACHE[cache_key]

        try:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                # In an active event loop, run in a dedicated thread to avoid loop collision
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                    future = pool.submit(asyncio.run, cls._generate_audio(clean_text, chosen_voice))
                    audio_b64 = future.result(timeout=10.0)
            else:
                audio_b64 = asyncio.run(cls._generate_audio(clean_text, chosen_voice))

            if audio_b64:
                if len(_VOICE_CACHE) >= _VOICE_CACHE_LIMIT:
                    _VOICE_CACHE.popitem(last=False)  # Evict oldest entry
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
