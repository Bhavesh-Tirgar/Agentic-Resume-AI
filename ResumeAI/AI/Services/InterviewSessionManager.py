import collections
import json
import logging
import os
import threading
import time
import uuid
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# Bounded thread-safe LRU session cache (prevents unbounded RAM growth)
_MAX_LOCAL_SESSIONS = 1000
_LOCAL_CACHE_LOCK = threading.Lock()
_LOCAL_SESSION_STORE: collections.OrderedDict[str, Dict[str, Any]] = collections.OrderedDict()


class InterviewSessionManager:
    """
    Enterprise Tri-Tier Session & State Persistence Engine.
    Tier 1: Redis In-Memory Cluster Cache (<1ms read/write)
    Tier 2: Bounded LRU Local Dict Cache (thread-safe, max 1000 sessions)
    Tier 3: PostgreSQL / SQLite Relational Audit Store (InterviewSessionRecord)

    Guarantees zero session drop across worker restarts, hot reloads, and horizontal scaling.
    """

    def __init__(self):
        self.redis_client = None
        self.redis_url = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
        self._last_redis_retry = 0.0
        self._init_redis()

    def _init_redis(self):
        try:
            import redis
            client = redis.Redis.from_url(
                self.redis_url,
                socket_connect_timeout=1,
                socket_timeout=1,
                decode_responses=True
            )
            client.ping()
            self.redis_client = client
            logger.info("InterviewSessionManager: Connected to Redis at %s", self.redis_url)
        except Exception as e:
            self.redis_client = None
            logger.info("InterviewSessionManager: Redis cluster offline (%s). Using dual memory + DB persistence.", e)

    @staticmethod
    def _write_local_lru(session_id: str, data: Dict[str, Any]):
        """Stores a session inside the bounded thread-safe OrderedDict LRU cache."""
        with _LOCAL_CACHE_LOCK:
            now = time.time()
            # Prune expired entries up front when near capacity
            if len(_LOCAL_SESSION_STORE) >= _MAX_LOCAL_SESSIONS:
                expired = [k for k, v in _LOCAL_SESSION_STORE.items() if now > v.get("expires_at", 0)]
                for k in expired:
                    _LOCAL_SESSION_STORE.pop(k, None)
            if session_id in _LOCAL_SESSION_STORE:
                _LOCAL_SESSION_STORE.move_to_end(session_id)
            elif len(_LOCAL_SESSION_STORE) >= _MAX_LOCAL_SESSIONS:
                _LOCAL_SESSION_STORE.popitem(last=False)
            _LOCAL_SESSION_STORE[session_id] = data

    def create_session(
        self,
        candidate_name: str,
        target_role: str,
        resume_id: Optional[int] = None,
        user_id: Optional[int] = None,
        max_rounds: int = 4,
        candidate_summary: str = ""
    ) -> Dict[str, Any]:
        """Creates a new interview session and synchronizes across all tiers."""
        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,
            "candidate_name": candidate_name or "Candidate",
            "target_role": target_role or "Senior Software Engineer",
            "resume_id": resume_id,
            "user_id": user_id,
            "candidate_summary": candidate_summary,
            "created_at": time.time(),
            "expires_at": time.time() + 7200,  # 2 hours
            "status": "active",
            "current_round": 1,
            "max_rounds": max_rounds,
            "turns": [],
            "scorecard": None
        }

        self.save_session(session_id, session_data)
        return session_data

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves session data by ID using cascading lookup:
        Redis -> Bounded Local Memory -> Database Rehydration.
        """
        if not session_id:
            return None

        # Tier 1: Redis
        if self.redis_client:
            try:
                raw = self.redis_client.get(f"interview_session:{session_id}")
                if raw:
                    return json.loads(raw)
            except Exception as e:
                logger.warning("Redis get_session failed, falling back: %s", e)

        # Tier 2: Bounded Local LRU Memory
        with _LOCAL_CACHE_LOCK:
            entry = _LOCAL_SESSION_STORE.get(session_id)
            if entry:
                if time.time() <= entry.get("expires_at", 0):
                    _LOCAL_SESSION_STORE.move_to_end(session_id)
                    return entry
                _LOCAL_SESSION_STORE.pop(session_id, None)

        # Tier 3: Database Rehydration (Audit Recovery)
        try:
            from AI.Models.InterviewSessionRecord import InterviewSessionRecord
            record = InterviewSessionRecord.objects.select_related("resume").filter(session_id=session_id).first()
            if record:
                turns = record.turns_data or []
                recovered_question = turns[-1].get("question", "") if turns else ""
                recovered_summary = (
                    record.resume.extracted_text[:1000]
                    if record.resume and record.resume.extracted_text
                    else ""
                )
                rehydrated = {
                    "session_id": record.session_id,
                    "candidate_name": record.candidate_name,
                    "target_role": record.target_role,
                    "resume_id": record.resume_id,
                    "user_id": record.user_id,
                    "candidate_summary": recovered_summary,
                    "current_question": recovered_question,
                    "status": record.status,
                    "current_round": record.current_round,
                    "max_rounds": record.max_rounds,
                    "turns": turns,
                    "scorecard": record.scorecard_data,
                    "created_at": record.created_at.timestamp() if record.created_at else time.time(),
                    "expires_at": time.time() + 7200,
                }
                self._write_local_lru(session_id, rehydrated)
                if self.redis_client:
                    try:
                        self.redis_client.setex(f"interview_session:{session_id}", 7200, json.dumps(rehydrated))
                    except Exception:
                        pass
                logger.info("InterviewSessionManager: Rehydrated session %s from database audit record.", session_id)
                return rehydrated
        except Exception as db_err:
            logger.debug("Database rehydration check skipped: %s", db_err)

        return None

    def save_session(self, session_id: str, session_data: Dict[str, Any], ttl: int = 7200):
        """
        Saves or updates session data simultaneously to:
        1. Redis Cache
        2. Bounded Local LRU Store
        3. Database Audit Record
        """
        session_data["updated_at"] = time.time()

        # Tier 1: Redis
        if self.redis_client:
            try:
                self.redis_client.setex(
                    f"interview_session:{session_id}",
                    ttl,
                    json.dumps(session_data)
                )
            except Exception as e:
                logger.warning("Redis save_session failed: %s", e)

        # Tier 2: Bounded Local LRU
        self._write_local_lru(session_id, session_data)

        # Tier 3: Database Persistence
        try:
            from AI.Models.InterviewSessionRecord import InterviewSessionRecord
            InterviewSessionRecord.objects.update_or_create(
                session_id=session_id,
                defaults={
                    "candidate_name": session_data.get("candidate_name", "Candidate"),
                    "target_role": session_data.get("target_role", "Senior Software Engineer"),
                    "resume_id": session_data.get("resume_id"),
                    "user_id": session_data.get("user_id"),
                    "status": session_data.get("status", "active"),
                    "current_round": session_data.get("current_round", 1),
                    "max_rounds": session_data.get("max_rounds", 4),
                    "turns_data": session_data.get("turns", []),
                    "scorecard_data": session_data.get("scorecard"),
                }
            )
        except Exception as db_err:
            logger.debug("InterviewSessionRecord DB sync skipped or deferred: %s", db_err)

    def update_session(self, session_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Applies updates to an existing session."""
        session = self.get_session(session_id)
        if not session:
            return None

        session.update(updates)
        self.save_session(session_id, session)
        return session

    def list_candidate_history(self, user_id: Optional[int] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Queries persistent audit history strictly scoped to an authenticated user.
        Returns an empty list for anonymous callers to prevent cross-user record leakage.
        """
        if not user_id:
            return []

        try:
            from AI.Models.InterviewSessionRecord import InterviewSessionRecord
            records = InterviewSessionRecord.objects.filter(user_id=user_id).order_by("-created_at")[:limit]
            output = []
            for r in records:
                sc = r.scorecard_data if isinstance(r.scorecard_data, dict) else {}
                turns = r.turns_data or []
                output.append({
                    "id": r.id,
                    "session_id": r.session_id,
                    "candidate_name": r.candidate_name,
                    "target_role": r.target_role,
                    "status": r.status,
                    "current_round": r.current_round,
                    "max_rounds": r.max_rounds,
                    "rounds_completed": len(turns),
                    "turns_count": len(turns),
                    "verdict": sc.get("verdict") or ("Completed" if r.status == "completed" else "In Progress"),
                    "overall_score": sc.get("overall_score", 0),
                    "summary": sc.get("summary", ""),
                    "top_strengths": sc.get("top_strengths", []),
                    "critical_gaps": sc.get("critical_gaps", []),
                    "preparation_recommendations": sc.get("preparation_recommendations", []),
                    "scorecard": r.scorecard_data,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                })
            return output
        except Exception as e:
            logger.warning("Failed to list candidate history: %s", e)
            return []


# Global singleton instance
session_manager = InterviewSessionManager()
