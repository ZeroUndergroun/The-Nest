from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.schemas.auth import LoginRequest, RegisterRequest, VerifyEmailRequest
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])

_SECURE = settings.frontend_url.startswith("https")
_COOKIE_OPTS = {"httponly": True, "samesite": "strict", "secure": _SECURE}


@router.post("/register", status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register(db, body.email, body.password, body.username, body.display_name, body.role)


@router.post("/verify-email")
def verify_email(body: VerifyEmailRequest, db: Session = Depends(get_db)):
    return auth_service.verify_email(db, body.token)


@router.post("/login")
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    tokens = auth_service.login(db, body.email, body.password)
    response.set_cookie("access_token", tokens["access_token"], **_COOKIE_OPTS)
    response.set_cookie("refresh_token", tokens["refresh_token"], **_COOKIE_OPTS)
    return {"message": "Logged in"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}


@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    result = auth_service.refresh_token(db, token)
    response.set_cookie("access_token", result["access_token"], **_COOKIE_OPTS)
    return {"message": "Token refreshed"}
