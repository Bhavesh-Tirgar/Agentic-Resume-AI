import json
import logging
import os
import time
import uuid
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

# In-memory session store fallback
_LOCAL_SESSION_STORE: Dict[str, Dict[str, Any]] = {}


class InterviewSessionManager:
    """
    Resilient Redis + In-Memory Session Manager for Virtual HR Mock Interviews.
    Persists turn history, candidate context, and dynamic scorecard states.
    Automatically falls back to local memory if Redis is unavailable or offline.
    """

    def __init__(self):
        self.redis_client = None
        self.redis_url = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
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
            logger.info("Virtual HR Session Manager: Connected to Redis at %s", self.redis_url)
        except Exception as e:
            self.redis_client = None
            logger.info("Virtual HR Session Manager: Redis not available (%s). Using resilient in-memory session cache.", e)

    def create_session(
        self,
        candidate_name: str,
        target_role: str,
        resume_id: Optional[int] = None,
        max_rounds: int = 4
    ) -> Dict[str, Any]:
        """Creates a new interview session."""
        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,
            "candidate_name": candidate_name or "Candidate",
            "target_role": target_role or "Software Engineer",
            "resume_id": resume_id,
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
        """Retrieves session data by ID."""
        if not session_id:
            return None

        # 1. Try Redis
        if self.redis_client:
            try:
                raw = self.redis_client.get(f"interview_session:{session_id}")
                if raw:
                    return json.loads(raw)
            except Exception as e:
                logger.warning("Redis get_session failed, checking memory fallback: %s", e)

        # 2. Try In-Memory Fallback
        entry = _LOCAL_SESSION_STORE.get(session_id)
        if entry:
            if time.time() > entry.get("expires_at", 0):
                del _LOCAL_SESSION_STORE[session_id]
                return None
            return entry

        return None

    def save_session(self, session_id: str, session_data: Dict[str, Any], ttl: int = 7200):
        """Saves or updates session data."""
        session_data["updated_at"] = time.time()

        # 1. Try Redis
        if self.redis_client:
            try:
                self.redis_client.setex(
                    f"interview_session:{session_id}",
                    ttl,
                    json.dumps(session_data)
                )
                return
            except Exception as e:
                logger.warning("Redis save_session failed, writing to memory fallback: %s", e)

        # 2. In-Memory Store
        _LOCAL_SESSION_STORE[session_id] = session_data

    def update_session(self, session_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Applies updates to an existing session."""
        session = self.get_session(session_id)
        if not session:
            return None

        session.update(updates)
        self.save_session(session_id, session)
        return session


# Global singleton instance
session_manager = InterviewSessionManager()
