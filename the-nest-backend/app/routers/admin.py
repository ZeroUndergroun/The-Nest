from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_admin_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/pending", response_model=list[UserResponse])
def list_pending(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == "staff", User.is_approved == False).all()


@router.post("/users/{user_id}/approve", response_model=UserResponse)
def approve_user(user_id: UUID, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_approved = True
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def reject_user(user_id: UUID, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
