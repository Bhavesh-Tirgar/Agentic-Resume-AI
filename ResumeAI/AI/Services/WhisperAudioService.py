import os
import io
import tempfile
import logging
import base64
from typing import Optional, Union, BinaryIO
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

class WhisperAudioService:
    """
    High-performance, local Whisper speech-to-text service.
    Transcribes candidate spoken audio in real-time with high accuracy across accents.
    """
    _model: Optional[WhisperModel] = None

    @classmethod
    def get_model(cls) -> WhisperModel:
        if cls._model is None:
            logger.info("Initializing faster-whisper (base.en) model on CPU...")
            cls._model = WhisperModel(
                "base.en",
                device="cpu",
                compute_type="int8",
                cpu_threads=4
            )
            logger.info("Whisper model loaded successfully.")
        return cls._model

    @classmethod
    def transcribe(cls, audio_source: Union[str, bytes, BinaryIO]) -> str:
        """
        Transcribes audio from a file path, raw bytes, or file-like object.
        Returns the clean, transcribed text.
        """
        model = cls.get_model()
        temp_file_path = None

        try:
            # High-Performance In-Memory Fast Path: Stream directly from RAM without disk I/O
            if isinstance(audio_source, bytes):
                file_to_transcribe = io.BytesIO(audio_source)
            elif hasattr(audio_source, "read"):
                content = audio_source.read()
                file_to_transcribe = io.BytesIO(content) if isinstance(content, bytes) else content
            else:
                file_to_transcribe = audio_source

            try:
                segments, info = model.transcribe(
                    file_to_transcribe,
                    beam_size=1,
                    language="en",
                    vad_filter=True,
                    vad_parameters=dict(min_silence_duration_ms=500)
                )
                transcription = " ".join(segment.text.strip() for segment in segments).strip()
            except Exception as stream_err:
                logger.info("In-memory audio stream decode fallback to tempfile: %s", stream_err)
                if isinstance(file_to_transcribe, io.BytesIO):
                    file_to_transcribe.seek(0)
                    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
                        f.write(file_to_transcribe.read())
                        temp_file_path = f.name
                    segments, info = model.transcribe(
                        temp_file_path,
                        beam_size=1,
                        language="en",
                        vad_filter=True,
                        vad_parameters=dict(min_silence_duration_ms=500)
                    )
                    transcription = " ".join(segment.text.strip() for segment in segments).strip()
                else:
                    raise stream_err
            logger.info("Whisper transcribed %d chars from audio (detected lang: %s, prob: %.2f)",
                        len(transcription), info.language, info.language_probability)
            return transcription

        except Exception as e:
            logger.exception("Whisper transcription error: %s", e)
            return ""
        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                except OSError:
                    pass

    @classmethod
    def transcribe_base64(cls, base64_audio: str) -> str:
        """Transcribes base64 encoded audio string."""
        if not base64_audio:
            return ""
        # Strip header if present (e.g., data:audio/webm;base64,...)
        if "," in base64_audio:
            base64_audio = base64_audio.split(",")[1]
        try:
            audio_bytes = base64.b64decode(base64_audio)
            return cls.transcribe(audio_bytes)
        except Exception as e:
            logger.error("Base64 decode failed for Whisper: %s", e)
            return ""
