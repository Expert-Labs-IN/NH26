"""
DocNerve job store.
Thread-safe in-memory tracking for analysis jobs.
"""

from __future__ import annotations

import copy
import threading
from datetime import datetime, timedelta, timezone
from typing import Any


class JobStore:
    def __init__(self) -> None:
        self._store: dict[str, dict[str, Any]] = {}
        self._lock = threading.Lock()

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _parse_timestamp(value: str) -> datetime:
        parsed = datetime.fromisoformat(value)
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed

    def create(self, job_id: str, file_count: int) -> dict[str, Any]:
        with self._lock:
            timestamp = self._now()
            payload = {
                "status": "processing",
                "progress": 0,
                "current_step": "initializing",
                "file_count": file_count,
                "result": None,
                "error": None,
                "created_at": timestamp,
                "updated_at": timestamp,
            }
            self._store[job_id] = payload
            return copy.deepcopy(payload)

    def update_progress(self, job_id: str, progress: int, step: str | None = None) -> None:
        with self._lock:
            job = self._store.get(job_id)
            if not job:
                return
            job["progress"] = max(0, min(100, progress))
            if step:
                job["current_step"] = step
            job["updated_at"] = self._now()

    def complete(self, job_id: str, result: dict[str, Any]) -> None:
        with self._lock:
            job = self._store.get(job_id)
            if not job:
                return
            job["status"] = "complete"
            job["progress"] = 100
            job["current_step"] = "complete"
            job["result"] = copy.deepcopy(result)
            job["error"] = None
            job["updated_at"] = self._now()

    def fail(self, job_id: str, error: str) -> None:
        with self._lock:
            job = self._store.get(job_id)
            if not job:
                return
            job["status"] = "error"
            job["current_step"] = "failed"
            job["result"] = None
            job["error"] = error
            job["updated_at"] = self._now()

    def get(self, job_id: str) -> dict[str, Any] | None:
        with self._lock:
            job = self._store.get(job_id)
            if job is None:
                return None
            return copy.deepcopy(job)

    def exists(self, job_id: str) -> bool:
        with self._lock:
            return job_id in self._store

    def cleanup_old(self, max_age_hours: int = 1) -> int:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=max_age_hours)
        removed = 0
        with self._lock:
            stale_ids = [
                job_id
                for job_id, job in self._store.items()
                if self._parse_timestamp(job["created_at"]) < cutoff
            ]
            for job_id in stale_ids:
                del self._store[job_id]
                removed += 1
        return removed


job_store = JobStore()
