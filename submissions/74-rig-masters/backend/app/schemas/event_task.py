from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from uuid import UUID


# ── Events ──────────────────────────────────────────────────────────────────

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None


class EventStatusUpdate(BaseModel):
    status: str  # pending | confirmed | cancelled


class EventResponse(BaseModel):
    id: UUID
    email_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Tasks ────────────────────────────────────────────────────────────────────

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[str] = None


class TaskStatusUpdate(BaseModel):
    status: str  # todo | in_progress | done


class TaskResponse(BaseModel):
    id: UUID
    email_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
