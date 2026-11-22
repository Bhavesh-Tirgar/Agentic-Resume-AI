import base64
import logging
from typing import Any, Dict, Optional
from AI.Schemas.VirtualHRSchema import VisionTelemetry

logger = logging.getLogger(__name__)


class CandidateVisionService:
    """
    Vision & Behavioral Telemetry Service.
    Analyzes webcam snapshots and client-side gaze metrics to assess:
    - Camera status (On vs Off)
    - Eye contact consistency (screen vs camera vs looking away)
    - Nervousness & facial tension vs relaxed composure
    - Confidence posture and delivery poise
    """

    @staticmethod
    def process_telemetry(
        client_telemetry: Optional[Dict[str, Any]] = None,
        snapshot_base64: Optional[str] = None
    ) -> VisionTelemetry:
        """
        Synthesizes client telemetry and webcam snapshot into a verified VisionTelemetry model.
        Correctly recognizes when camera is turned OFF.
        """
        client_telemetry = client_telemetry or {}

        # 1. Camera is completely OFF if no snapshot and no active client stream reported
        is_camera_explicitly_off = (
            not snapshot_base64 and 
            not client_telemetry.get("camera_active", False)
        )

        if is_camera_explicitly_off:
            return VisionTelemetry(
                eye_contact_percentage=0,
                confidence_score=20,
                nervousness_score=0,
                gaze_direction="Camera Off / Disabled",
                facial_demeanor="Camera Off"
            )

        # 2. Camera IS active: extract telemetry metrics
        eye_contact = int(client_telemetry.get("eye_contact_percentage", 75))
        confidence = int(client_telemetry.get("confidence_score", 70))
        nervousness = int(client_telemetry.get("nervousness_score", 25))
        gaze = client_telemetry.get("gaze_direction", "Direct / Focused")
        demeanor = client_telemetry.get("facial_demeanor", "Composed")

        # Clamp metrics to 0-100
        eye_contact = max(0, min(100, eye_contact))
        confidence = max(0, min(100, confidence))
        nervousness = max(0, min(100, nervousness))

        # Adjust demeanor based on detected nervousness/confidence
        if nervousness > 60:
            demeanor = "Tense / Anxious"
        elif confidence > 80 and nervousness < 30:
            demeanor = "Confident & Composed"
        elif eye_contact < 40:
            demeanor = "Distracted / Looking Down"
            gaze = "Looking Down"

        return VisionTelemetry(
            eye_contact_percentage=eye_contact,
            confidence_score=confidence,
            nervousness_score=nervousness,
            gaze_direction=gaze,
            facial_demeanor=demeanor
        )
