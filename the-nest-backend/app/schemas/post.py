from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PostCreate(BaseModel):
    content: str = Field(..., max_length=280)
    parent_post_id: Optional[UUID] = None


class PostAuthor(BaseModel):
    username: str
    display_name: str
    avatar_url: Optional[str]
    role: str

    model_config = {"from_attributes": True}


class PostResponse(BaseModel):
    id: UUID
    user_id: UUID
    content: str
    is_reply: bool
    like_count: int
    reply_count: int
    repost_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PostWithAuthor(PostResponse):
    user: Optional[PostAuthor] = None
