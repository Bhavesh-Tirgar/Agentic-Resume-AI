import logging
from typing import Dict, Any

try:
    from celery import shared_task
except ImportError:
    # Graceful synchronous decorator fallback when Celery isn't installed in lightweight local dev
    def shared_task(*args, **kwargs):
        def decorator(fn):
            fn.delay = lambda *a, **kw: fn(*a, **kw)
            return fn
        if len(args) == 1 and callable(args[0]) and not kwargs:
            return decorator(args[0])
        return decorator

logger = logging.getLogger(__name__)


@shared_task(name="ai.transcribe_audio_base64")
def transcribe_audio_task(audio_base64: str) -> Dict[str, Any]:
    """Async Celery worker task for heavy Whisper STT inference offloading."""
    from AI.Services.WhisperAudioService import WhisperAudioService
    text = WhisperAudioService.transcribe_base64(audio_base64)
    return {"transcribed_text": text}


@shared_task(name="ai.process_resume_dossier")
def process_resume_task(resume_id: int) -> Dict[str, Any]:
    """Async Celery worker task for Unified Dossier Synthesis."""
    from Resume.models import Resume
    from AI.Services.ResumeProcessService import ResumeProcessingService

    resume = Resume.objects.get(id=resume_id)
    res = ResumeProcessingService.process(resume)
    return {"resume_id": resume_id, "latency_seconds": res.get("latency_seconds", 0.0)}


@shared_task(name="ai.discover_nearby_jobs")
def discover_jobs_task(resume_id: int, location: str, work_type: str = "All", radius_km: int = 25) -> Dict[str, Any]:
    """Async Celery worker task for multi-source job discovery and commute calculation."""
    from Resume.models import Resume
    from AI.Services.JobDiscoveryService import JobDiscoveryService

    resume = Resume.objects.get(id=resume_id)
    result = JobDiscoveryService.discover_jobs(
        resume=resume,
        location=location,
        work_type=work_type,
        radius_km=radius_km,
    )
    return {"discovery_id": result.id, "total_jobs": result.discovery_data.get("total_jobs_found", 0)}
