from sqlalchemy import Column, String, Text, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class Email(Base):
    __tablename__ = "emails"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(String, unique=True, nullable=False)
    sender = Column(String, nullable=False)
    sender_name = Column(String, nullable=True)          # e.g. "John Smith"
    recipient = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    received_at = Column(DateTime(timezone=True), nullable=False)

    # AI-assigned fields
    priority_label = Column(String, nullable=True)       # urgent | requires_action | fyi
    priority_reasoning = Column(Text, nullable=True)
    suggested_actions = Column(JSON, nullable=True)      # e.g. ["reply", "calendar_event"]
    summary_bullets = Column(JSON, nullable=True)        # cached: ["bullet1", "bullet2", "bullet3"]

    is_read = Column(Boolean, default=False, nullable=False)
    raw_json = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    drafted_actions = relationship("DraftedAction", back_populates="email", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="email", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="email", cascade="all, delete-orphan")