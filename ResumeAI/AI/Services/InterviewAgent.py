import logging
import time
from typing import Any, Dict, Optional, Union, BinaryIO

from AI.Services.VirtualHRService import VirtualHRService
from AI.Services.WhisperAudioService import WhisperAudioService
from AI.Services.CandidateVisionService import CandidateVisionService
from AI.Services.InterviewSessionManager import session_manager

logger = logging.getLogger(__name__)


class InterviewAgent:
    """
    Autonomous Technical & Behavioral Interview Agent.
    Coordinates Whisper speech recognition, multi-turn conversational memory,
    real-time candidate answer evaluation, and adaptive bar-raiser probing.
    """

    def __init__(self):
        self.hr_service = VirtualHRService()

    def process_turn(
        self,
        session_id: str,
        audio_file: Optional[Union[BinaryIO, bytes]] = None,
        audio_base64: Optional[str] = None,
        text_answer: Optional[str] = None,
        client_telemetry: Optional[Dict[str, Any]] = None,
        snapshot_base64: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processes a full interview turn.
        If voice audio is provided, transcribes it via Whisper;
        otherwise uses the direct text answer.
        """
        transcribed_text = ""

        # 1. Transcribe audio if provided
        if audio_file:
            logger.info("InterviewAgent: Transcribing incoming audio file with Whisper...")
            transcribed_text = WhisperAudioService.transcribe(audio_file)
        elif audio_base64:
            logger.info("InterviewAgent: Transcribing base64 audio with Whisper...")
            transcribed_text = WhisperAudioService.transcribe_base64(audio_base64)

        # 2. Resolve final candidate answer
        resolved_answer = text_answer.strip() if text_answer and text_answer.strip() else transcribed_text

        if not resolved_answer:
            resolved_answer = "No audible answer detected. Could you please clarify your response?"

        # 3. Evaluate response using Bar Raiser reasoning
        eval_result = self.hr_service.evaluate_turn(
            session_id=session_id,
            candidate_answer=resolved_answer,
            client_telemetry=client_telemetry,
            snapshot_base64=snapshot_base64
        )

        # Attach transcription information
        eval_result["transcribed_text"] = resolved_answer
        eval_result["used_whisper"] = bool(audio_file or audio_base64)

        return eval_result
