from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel

UserRole = Literal["current_student", "alumni", "incoming_student", "staff"]


class UserResponse(BaseModel):
    id: UUID
    email: str
    username: str
    display_name: str
    avatar_url: Optional[str]
    bio: Optional[str]
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}


class UserPublicProfile(BaseModel):
    username: str
    display_name: str
    avatar_url: Optional[str]
    bio: Optional[str]
    role: UserRole
    created_at: datetime
    follower_count: int = 0
    following_count: int = 0
    is_following: bool = False


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
