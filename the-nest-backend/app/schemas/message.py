from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: UUID
    sender_id: UUID
    recipient_id: UUID
    content: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationPartner(BaseModel):
    username: str
    display_name: str
    avatar_url: Optional[str] = None


class ConversationResponse(BaseModel):
    other_user: ConversationPartner
    latest_message: str
    latest_at: datetime
    unread_count: int
