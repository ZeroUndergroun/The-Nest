import uuid
from sqlalchemy import Boolean, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database import Base


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tag = Column(String(20), nullable=False)       # "Announcement", "Event", "Deadline"
    title = Column(String(200), nullable=False)
    date = Column(String(50), nullable=False)       # display string e.g. "June 1, 2026"
    description = Column(Text, nullable=True)
    is_approved = Column(Boolean, nullable=False, default=True)
    submitted_by = Column(String, nullable=True)   # username of submitter, null if admin-created
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
