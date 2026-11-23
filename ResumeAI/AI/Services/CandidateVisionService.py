import base64
import logging
from typing import Any, Dict, Optional
from AI.Schemas.VirtualHRSchema import VisionTelemetry

logger = logging.getLogger(__name__)


class CandidateVisionService:
    """
    Vision & Behavioral Telemetry Service (JARVIS Multimodal Engine).
    Analyzes webcam snapshots and client-side gaze metrics via multimodal vision to assess:
    - Camera status (On vs Off)
    - Eye contact consistency (screen vs camera vs looking away)
    - Nervousness & facial tension vs relaxed composure
    - Confidence posture and delivery poise
    - Reading / cheating cues (glancing away from lens at notes)
    """

    @classmethod
    def analyze_snapshot_with_vision(cls, snapshot_base64: str) -> Optional[VisionTelemetry]:
        """
        Runs true multimodal vision inference on the webcam snapshot frame.
        """
        if not snapshot_base64:
            return None

        # Clean base64 header if present
        cleaned_b64 = snapshot_base64
        if "base64," in cleaned_b64:
            cleaned_b64 = cleaned_b64.split("base64,")[1]

        try:
            from AI.Services.GeminiService import GeminiService
            from langchain_core.messages import HumanMessage

            service = GeminiService()
            structured = service.get_structured_llm(VisionTelemetry)

            prompt = (
                "You are an expert computer vision behavioral analyst evaluating a remote engineering interview. "
                "Analyze this webcam snapshot carefully for: "
                "1. eye_contact_percentage (0-100): 80-100 if looking directly at lens, 40-70 if glancing at screen, <30 if looking down/away. "
                "2. confidence_score (0-100): based on posture, upright head alignment, and facial composure. "
                "3. nervousness_score (0-100): based on facial tension, stiff shoulders, or stressed expression. "
                "4. gaze_direction: 'Direct / Focused', 'Looking Down', 'Looking Away', or 'Camera Off / Disabled'. "
                "5. facial_demeanor: 'Confident & Composed', 'Calm', 'Tense / Anxious', 'Distracted / Reading Notes', or 'Camera Off'."
            )

            msg = HumanMessage(content=[
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": f"data:image/jpeg;base64,{cleaned_b64}"}
            ])

            result: VisionTelemetry = structured.invoke([msg])
            logger.info("CandidateVisionService: Multimodal vision successfully analyzed snapshot -> %s", result.model_dump())
            return result
        except Exception as exc:
            logger.warning("CandidateVisionService: Vision analysis failed, falling back to heuristics: %s", exc)
            return None

    @classmethod
    def process_telemetry(
        cls,
        client_telemetry: Optional[Dict[str, Any]] = None,
        snapshot_base64: Optional[str] = None
    ) -> VisionTelemetry:
        """
        Synthesizes client telemetry and webcam snapshot into a verified VisionTelemetry model.
        Prioritizes true multimodal vision analysis when snapshot is available.
        Correctly recognizes when camera is turned OFF.
        """
        client_telemetry = client_telemetry or {}

        # 1. Camera is completely OFF if no snapshot and client explicitly reports camera disabled
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

        # 2. Try multimodal vision inference on the snapshot if provided
        if snapshot_base64:
            vision_result = cls.analyze_snapshot_with_vision(snapshot_base64)
            if vision_result:
                return vision_result

        # 3. Fallback to calibrated telemetry heuristics
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
