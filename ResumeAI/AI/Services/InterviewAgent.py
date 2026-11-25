import logging
from typing import Any, Callable, Dict, Optional, Tuple, Union, BinaryIO

from AI.Services.VirtualHRService import VirtualHRService
from AI.Services.WhisperAudioService import WhisperAudioService

logger = logging.getLogger(__name__)


class InterviewAgent:
    """
    Autonomous Technical & Behavioral Interview Agent.
    Coordinates Whisper speech recognition, multi-turn conversational memory,
    real-time candidate answer evaluation, and adaptive bar-raiser probing.
    """

    def __init__(self):
        self.hr_service = VirtualHRService()

    @staticmethod
    def resolve_answer(
        audio_file: Optional[Union[BinaryIO, bytes]] = None,
        audio_base64: Optional[str] = None,
        text_answer: Optional[str] = None,
    ) -> Tuple[str, bool]:
        """Resolves candidate answer via fast-path text or Whisper speech transcription."""
        if text_answer and text_answer.strip():
            logger.info("InterviewAgent: Fast-Path text transcript provided, skipping Whisper.")
            return text_answer.strip(), False
        if audio_file:
            logger.info("InterviewAgent: Transcribing incoming audio file with Whisper...")
            return WhisperAudioService.transcribe(audio_file), True
        if audio_base64:
            logger.info("InterviewAgent: Transcribing base64 audio with Whisper...")
            return WhisperAudioService.transcribe_base64(audio_base64), True
        return "No audible answer detected. Could you please clarify your response?", False

    def process_turn(
        self,
        session_id: str,
        audio_file: Optional[Union[BinaryIO, bytes]] = None,
        audio_base64: Optional[str] = None,
        text_answer: Optional[str] = None,
        client_telemetry: Optional[Dict[str, Any]] = None,
        snapshot_base64: Optional[str] = None,
        progress_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None,
    ) -> Dict[str, Any]:
        """
        Processes a full interview turn using shared answer resolution and evaluation logic.
        """
        resolved_answer, used_whisper = self.resolve_answer(
            audio_file=audio_file,
            audio_base64=audio_base64,
            text_answer=text_answer,
        )

        eval_result = self.hr_service.evaluate_turn(
            session_id=session_id,
            candidate_answer=resolved_answer,
            client_telemetry=client_telemetry,
            snapshot_base64=snapshot_base64,
            progress_callback=progress_callback,
        )

        eval_result["transcribed_text"] = resolved_answer
        eval_result["used_whisper"] = used_whisper

        return eval_result
