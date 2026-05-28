from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
import bcrypt
from jose import jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import verify_jwt
from app.models.user import User
from app.services import email_service

EMAIL_VERIFY_EXPIRE_HOURS = 24


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": subject, "exp": expire}, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    return jwt.encode({"sub": subject, "exp": expire, "type": "refresh"}, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_email_verify_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=EMAIL_VERIFY_EXPIRE_HOURS)
    return jwt.encode({"sub": user_id, "exp": expire, "type": "email_verify"}, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def _is_allowed_email(email: str) -> bool:
    lower = email.lower()
    if lower.endswith("@calstatela.edu") or lower.endswith("@my.calstatela.edu"):
        return True
    if settings.dev_allowed_emails:
        allowed = {e.strip().lower() for e in settings.dev_allowed_emails.split(",")}
        return lower in allowed
    return False


def register(db: Session, email: str, password: str, username: str, display_name: str, role: str) -> dict:
    if not _is_allowed_email(email):
        raise HTTPException(status_code=400, detail="Only @calstatela.edu emails are allowed")

    if db.query(User).filter(User.email == email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    admin_emails = {e.strip().lower() for e in (settings.admin_emails or "").split(",") if e.strip()}

    user = User(
        email=email.lower(),
        username=username,
        display_name=display_name,
        role=role,
        password_hash=hash_password(password),
        is_approved=True,
        is_admin=email.lower() in admin_emails,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_email_verify_token(str(user.id))
    if settings.debug:
        print(f"\n[DEV] Verification token for {user.email}: {token}\n")
    try:
        email_service.send_verification_email(user.email, token)
    except Exception:
        pass

    return {"message": "Verification email sent. Check your inbox."}


def verify_email(db: Session, token: str) -> dict:
    payload = verify_jwt(token)

    if payload.get("type") != "email_verify":
        raise HTTPException(status_code=400, detail="Invalid token type")

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.email_verified:
        return {"message": "Email already verified"}

    user.email_verified = True
    db.commit()
    return {"message": "Email verified. You can now log in."}


def login(db: Session, email: str, password: str) -> dict:
    user = db.query(User).filter(User.email == email.lower()).first()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if not user.email_verified:
        raise HTTPException(status_code=401, detail="Please verify your email before logging in")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is inactive")

    if not user.is_approved:
        raise HTTPException(status_code=403, detail="Your account is pending admin approval")

    return {
        "access_token": create_access_token(str(user.id)),
        "refresh_token": create_refresh_token(str(user.id)),
        "user": user,
    }


def refresh_token(db: Session, token: str | None) -> dict:
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token provided")

    payload = verify_jwt(token)

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    return {"access_token": create_access_token(str(user.id))}
