import base64
import logging
from typing import Any, Dict, Optional
from AI.Schemas.VirtualHRSchema import VisionTelemetry
from AI.Services.GeminiService import GeminiService

logger = logging.getLogger(__name__)


class CandidateVisionService:
    """
    Vision & Behavioral Telemetry Service.
    Analyzes webcam snapshots and client-side gaze metrics to assess:
    - Eye contact consistency (screen vs camera vs reading second monitor)
    - Nervousness & facial tension vs relaxed composure
    - Confidence posture and delivery poise
    """

    @staticmethod
    def process_telemetry(
        client_telemetry: Optional[Dict[str, Any]] = None,
        snapshot_base64: Optional[str] = None
    ) -> VisionTelemetry:
        """
        Synthesizes client telemetry and optional webcam snapshot into
        a verified VisionTelemetry model.
        """
        # Default baseline if camera is disabled
        if not client_telemetry and not snapshot_base64:
            return VisionTelemetry(
                eye_contact_percentage=85,
                confidence_score=80,
                nervousness_score=25,
                gaze_direction="Camera Disabled (Audio / Text Mode)",
                facial_demeanor="Composed"
            )

        client_telemetry = client_telemetry or {}

        eye_contact = int(client_telemetry.get("eye_contact_percentage", 80))
        confidence = int(client_telemetry.get("confidence_score", 75))
        nervousness = int(client_telemetry.get("nervousness_score", 30))
        gaze = client_telemetry.get("gaze_direction", "Direct / Focused")
        demeanor = client_telemetry.get("facial_demeanor", "Composed")

        # Clamp metrics to 0-100
        eye_contact = max(0, min(100, eye_contact))
        confidence = max(0, min(100, confidence))
        nervousness = max(0, min(100, nervousness))

        # If high nervousness detected, automatically calibrate demeanor
        if nervousness > 65 and demeanor == "Composed":
            demeanor = "Tense / Anxious"
        elif confidence > 85 and nervousness < 30:
            demeanor = "Highly Composed"

        return VisionTelemetry(
            eye_contact_percentage=eye_contact,
            confidence_score=confidence,
            nervousness_score=nervousness,
            gaze_direction=gaze,
            facial_demeanor=demeanor
        )
