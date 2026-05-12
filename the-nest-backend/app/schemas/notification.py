from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class NotificationActor(BaseModel):
    username: str
    display_name: str
    avatar_url: Optional[str] = None


class NotificationResponse(BaseModel):
    id: UUID
    type: str
    is_read: bool
    created_at: datetime
    post_id: Optional[UUID] = None
    actor: NotificationActor
