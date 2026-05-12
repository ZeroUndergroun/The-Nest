from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services import notification_service

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/", response_model=list[NotificationResponse])
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return notification_service.get_notifications(db, current_user)


@router.get("/unread-count")
def unread_count(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"count": notification_service.get_unread_count(db, current_user)}


@router.patch("/read", status_code=204)
def mark_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notification_service.mark_read(db, current_user)
