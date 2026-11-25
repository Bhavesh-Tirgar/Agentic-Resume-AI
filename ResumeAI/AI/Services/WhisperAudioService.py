import os
import io
import tempfile
import logging
import base64
import threading
from typing import Optional, Union, BinaryIO
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

# Concurrency limiter to prevent multi-user CPU starvation
_WHISPER_SEMAPHORE = threading.Semaphore(2)
_MODEL_LOCK = threading.Lock()


class WhisperAudioService:
    """
    High-performance, local Whisper speech-to-text service.
    Transcribes candidate spoken audio in real-time with thread-safe concurrency management
    and hard payload/queue bounds.
    """
    _model: Optional[WhisperModel] = None
    MAX_AUDIO_BYTES = 15 * 1024 * 1024  # 15 MB hard cap per audio clip
    SEMAPHORE_TIMEOUT_SEC = 15.0

    @classmethod
    def get_model(cls) -> WhisperModel:
        if cls._model is None:
            with _MODEL_LOCK:
                if cls._model is None:
                    # Dynamically calibrate thread allocation to prevent 100% CPU starvation
                    total_cores = os.cpu_count() or 2
                    safe_threads = max(1, min(2, total_cores // 2))
                    logger.info("Initializing faster-whisper (base.en) model on CPU with %d threads...", safe_threads)
                    cls._model = WhisperModel(
                        "base.en",
                        device="cpu",
                        compute_type="int8",
                        cpu_threads=safe_threads,
                    )
                    logger.info("Whisper model loaded successfully.")
        return cls._model

    @classmethod
    def _run_transcribe(cls, model: WhisperModel, target: Union[str, io.BytesIO]) -> str:
        """Executes faster-whisper transcription with uniform VAD and decoding settings."""
        segments, info = model.transcribe(
            target,
            beam_size=1,
            language="en",
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500),
        )
        transcription = " ".join(segment.text.strip() for segment in segments).strip()
        logger.info(
            "Whisper transcribed %d chars from audio (detected lang: %s, prob: %.2f)",
            len(transcription),
            info.language,
            info.language_probability,
        )
        return transcription

    @classmethod
    def _coerce_audio_input(cls, audio_source: Union[str, bytes, BinaryIO]) -> Union[str, io.BytesIO]:
        """Normalizes audio input to path or bounded BytesIO, enforcing MAX_AUDIO_BYTES."""
        if isinstance(audio_source, bytes):
            if len(audio_source) > cls.MAX_AUDIO_BYTES:
                raise ValueError("Audio payload exceeds maximum 15 MB limit.")
            return io.BytesIO(audio_source)

        if hasattr(audio_source, "read"):
            declared_size = getattr(audio_source, "size", None)
            if declared_size is not None and declared_size > cls.MAX_AUDIO_BYTES:
                raise ValueError("Audio file exceeds maximum 15 MB limit.")
            content = audio_source.read(cls.MAX_AUDIO_BYTES + 1)
            if isinstance(content, bytes):
                if len(content) > cls.MAX_AUDIO_BYTES:
                    raise ValueError("Audio file exceeds maximum 15 MB limit.")
                return io.BytesIO(content)
            return content

        return audio_source

    @classmethod
    def transcribe(cls, audio_source: Union[str, bytes, BinaryIO]) -> str:
        """
        Transcribes audio from a file path, raw bytes, or file-like object.
        Enforces semaphore queueing around full inference and fail-fast payload bounds.
        Returns the clean, transcribed text.
        """
        file_to_transcribe = cls._coerce_audio_input(audio_source)

        acquired = _WHISPER_SEMAPHORE.acquire(timeout=cls.SEMAPHORE_TIMEOUT_SEC)
        if not acquired:
            raise TimeoutError("Speech transcription workers are currently saturated. Please retry shortly.")

        temp_file_path = None
        try:
            model = cls.get_model()
            try:
                return cls._run_transcribe(model, file_to_transcribe)
            except Exception as stream_err:
                logger.info("In-memory audio stream decode fallback to tempfile: %s", stream_err)
                if isinstance(file_to_transcribe, io.BytesIO):
                    file_to_transcribe.seek(0)
                    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
                        f.write(file_to_transcribe.read())
                        temp_file_path = f.name
                    return cls._run_transcribe(model, temp_file_path)
                raise stream_err
        except Exception as e:
            logger.exception("Whisper transcription error: %s", e)
            return ""
        finally:
            _WHISPER_SEMAPHORE.release()
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                except OSError:
                    pass

    @classmethod
    def transcribe_base64(cls, base64_audio: str) -> str:
        """Transcribes base64 encoded audio string with size pre-check."""
        if not base64_audio:
            return ""
        # Strip header if present (e.g., data:audio/webm;base64,...)
        if "," in base64_audio:
            base64_audio = base64_audio.split(",", 1)[1]
        if len(base64_audio) > int(cls.MAX_AUDIO_BYTES * 1.4):
            raise ValueError("Encoded audio payload exceeds maximum 15 MB limit.")
        try:
            audio_bytes = base64.b64decode(base64_audio)
            return cls.transcribe(audio_bytes)
        except ValueError:
            raise
        except Exception as e:
            logger.error("Base64 decode failed for Whisper: %s", e)
            return ""
