from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from uuid import UUID


class DraftRequest(BaseModel):
    action_type: str  # reply | calendar_event | task_extraction


class RegenerateRequest(BaseModel):
    prompt: str


class EditActionRequest(BaseModel):
    edited_content: Any


class DraftedActionResponse(BaseModel):
    id: UUID
    email_id: UUID
    action_type: str
    content: Any
    edited_content: Optional[Any] = None
    status: str
    executed_at: Optional[datetime] = None
    execution_payload: Optional[Any] = None
    regeneration_prompt: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
