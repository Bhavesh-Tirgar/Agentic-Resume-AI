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

        # 1. Fast-Path: If direct text transcript is already available, skip Whisper entirely (<1ms)
        if text_answer and text_answer.strip():
            logger.info("InterviewAgent: Fast-Path text transcript provided, skipping Whisper.")
            resolved_answer = text_answer.strip()
            used_whisper = False
        elif audio_file:
            logger.info("InterviewAgent: Transcribing incoming audio file with Whisper...")
            resolved_answer = WhisperAudioService.transcribe(audio_file)
            used_whisper = True
        elif audio_base64:
            logger.info("InterviewAgent: Transcribing base64 audio with Whisper...")
            resolved_answer = WhisperAudioService.transcribe_base64(audio_base64)
            used_whisper = True
        else:
            resolved_answer = "No audible answer detected. Could you please clarify your response?"
            used_whisper = False

        # 2. Evaluate response using Bar Raiser reasoning
        eval_result = self.hr_service.evaluate_turn(
            session_id=session_id,
            candidate_answer=resolved_answer,
            client_telemetry=client_telemetry,
            snapshot_base64=snapshot_base64
        )

        # Attach transcription information
        eval_result["transcribed_text"] = resolved_answer
        eval_result["used_whisper"] = used_whisper

        return eval_result
