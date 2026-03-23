from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email_id = Column(UUID(as_uuid=True), ForeignKey("emails.id", ondelete="SET NULL"), nullable=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    start_datetime = Column(DateTime(timezone=True), nullable=True)
    end_datetime = Column(DateTime(timezone=True), nullable=True)

    # pending | confirmed | cancelled
    status = Column(String, nullable=False, default="pending")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    email = relationship("Email", back_populates="events")
