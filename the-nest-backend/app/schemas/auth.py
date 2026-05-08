from pydantic import BaseModel, EmailStr
from typing import Literal

UserRole = Literal["current_student", "alumni", "incoming_student", "staff"]


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    username: str
    display_name: str
    role: UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class VerifyEmailRequest(BaseModel):
    token: str
