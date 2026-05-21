from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PostCreate(BaseModel):
    content: str = Field(..., max_length=280)
    parent_post_id: Optional[UUID] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None


class PostUpdate(BaseModel):
    content: str = Field(..., max_length=280)


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
    parent_post_id: Optional[UUID] = None
    is_reply: bool
    like_count: int
    reply_count: int
    repost_count: int
    edit_count: int
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PostWithAuthor(PostResponse):
    user: Optional[PostAuthor] = None
    reposted_by: Optional[str] = None
