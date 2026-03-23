from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class DraftedAction(Base):
    __tablename__ = "drafted_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email_id = Column(UUID(as_uuid=True), ForeignKey("emails.id", ondelete="CASCADE"), nullable=False)

    # reply | calendar_event | task_extraction
    action_type = Column(String, nullable=False)

    # AI-generated content (raw output)
    content = Column(JSON, nullable=False)

    # User-edited version (null until user edits)
    edited_content = Column(JSON, nullable=True)

    # pending | approved | rejected | executed
    status = Column(String, nullable=False, default="pending")

    # Populated when status = executed
    executed_at = Column(DateTime(timezone=True), nullable=True)
    execution_payload = Column(JSON, nullable=True)

    # Custom prompt used for regeneration (if any)
    regeneration_prompt = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    email = relationship("Email", back_populates="drafted_actions")
