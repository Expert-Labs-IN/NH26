from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class EmailIngest(BaseModel):
    message_id: str
    sender: str
    sender_name: Optional[str] = None
    recipient: Optional[str] = None
    subject: str
    body: str
    received_at: datetime


class EmailListItem(BaseModel):
    id: UUID
    message_id: str
    sender: str
    sender_name: Optional[str] = None
    subject: str
    received_at: datetime
    priority_label: Optional[str] = None
    suggested_actions: Optional[List[str]] = None
    is_read: bool

    class Config:
        from_attributes = True


class EmailDetail(BaseModel):
    id: UUID
    message_id: str
    sender: str
    sender_name: Optional[str] = None
    recipient: Optional[str] = None
    subject: str
    body: str
    received_at: datetime
    priority_label: Optional[str] = None
    priority_reasoning: Optional[str] = None
    suggested_actions: Optional[List[str]] = None
    summary_bullets: Optional[List[str]] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class EmailMarkRead(BaseModel):
    is_read: bool


class IngestResponse(BaseModel):
    ingested: int
    skipped: int
    message: str