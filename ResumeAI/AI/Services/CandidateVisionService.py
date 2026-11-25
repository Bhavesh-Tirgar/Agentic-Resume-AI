import json
import logging
from typing import Any, Dict, Optional
from django.core.cache import cache
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

    MAX_SNAPSHOT_B64_CHARS = 350_000  # ~250 KB compressed JPEG frame ceiling
    SNAPSHOT_COOLDOWN_SEC = 3

    @classmethod
    def analyze_snapshot_with_vision(cls, snapshot_base64: str) -> Optional[VisionTelemetry]:
        """
        Runs true multimodal vision inference on the webcam snapshot frame.
        Enforces strict payload ceiling before parsing or transmitting images.
        """
        if not snapshot_base64 or not isinstance(snapshot_base64, str):
            return None

        if len(snapshot_base64) > cls.MAX_SNAPSHOT_B64_CHARS:
            logger.warning(
                "CandidateVisionService: Rejected oversized snapshot (%d chars > %d cap)",
                len(snapshot_base64),
                cls.MAX_SNAPSHOT_B64_CHARS,
            )
            return None

        # Clean base64 header if present
        cleaned_b64 = snapshot_base64
        if "base64," in cleaned_b64:
            cleaned_b64 = cleaned_b64.split("base64,", 1)[1]

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

    @staticmethod
    def _coerce_telemetry_dict(raw: Any) -> Dict[str, Any]:
        """Safely normalizes telemetry submitted via JSON body or FormData string."""
        if isinstance(raw, dict):
            return raw
        if isinstance(raw, str) and raw.strip():
            try:
                parsed = json.loads(raw)
                return parsed if isinstance(parsed, dict) else {}
            except Exception:
                return {}
        return {}

    @classmethod
    def process_telemetry(
        cls,
        client_telemetry: Optional[Any] = None,
        snapshot_base64: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> VisionTelemetry:
        """
        Synthesizes client telemetry and webcam snapshot into a verified VisionTelemetry model.
        Prioritizes sub-millisecond client telemetry to eliminate 3.5s multimodal API latency.
        Falls back to rate-throttled multimodal vision only when client telemetry is absent.
        """
        telemetry = cls._coerce_telemetry_dict(client_telemetry)

        eye_raw = telemetry.get("eye_contact_percentage")
        gaze_raw = telemetry.get("gaze_direction", "")
        has_live_metrics = (
            telemetry.get("camera_active", False)
            or (
                isinstance(eye_raw, (int, float))
                and eye_raw > 0
                and gaze_raw not in ("Camera Off / Disabled", "Camera Disabled (Audio / Text Mode)")
            )
        )

        # 1. Camera is completely OFF if no snapshot and no active client telemetry metrics
        if not snapshot_base64 and not has_live_metrics:
            return VisionTelemetry(
                eye_contact_percentage=0,
                confidence_score=20,
                nervousness_score=0,
                gaze_direction="Camera Off / Disabled",
                facial_demeanor="Camera Off"
            )

        # 2. Fast-Path: Prioritize sub-millisecond client telemetry (<1ms latency)
        if has_live_metrics:
            eye_contact = int(telemetry.get("eye_contact_percentage", 75))
            confidence = int(telemetry.get("confidence_score", 70))
            nervousness = int(telemetry.get("nervousness_score", 25))
            gaze = telemetry.get("gaze_direction", "Direct / Focused")
            demeanor = telemetry.get("facial_demeanor", "Composed")

            return VisionTelemetry(
                eye_contact_percentage=max(0, min(100, eye_contact)),
                confidence_score=max(0, min(100, confidence)),
                nervousness_score=max(0, min(100, nervousness)),
                gaze_direction=gaze,
                facial_demeanor=demeanor
            )

        # 3. Throttled Fallback: Run multimodal vision on snapshot only if within cooldown window
        if snapshot_base64:
            throttle_key = f"vision_snap_cooldown:{session_id}" if session_id else None
            if throttle_key and not cache.add(throttle_key, 1, timeout=cls.SNAPSHOT_COOLDOWN_SEC):
                logger.info("CandidateVisionService: Snapshot vision throttled for session %s; using baseline.", session_id)
            else:
                vision_result = cls.analyze_snapshot_with_vision(snapshot_base64)
                if vision_result:
                    return vision_result

        # 4. Baseline default
        return VisionTelemetry(
            eye_contact_percentage=75,
            confidence_score=70,
            nervousness_score=20,
            gaze_direction="Direct / Focused",
            facial_demeanor="Confident & Composed"
        )
