from fastapi import Cookie, Depends, HTTPException
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User


def _admin_emails() -> set[str]:
    return {e.strip().lower() for e in (settings.admin_emails or "").split(",") if e.strip()}


def verify_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user(
    access_token: str = Cookie(None),
    db: Session = Depends(get_db),
) -> User:
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = verify_jwt(access_token)
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin and current_user.email.lower() not in _admin_emails():
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
