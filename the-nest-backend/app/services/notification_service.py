from uuid import UUID

from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user import User


def create_notification(db: Session, recipient_id: UUID, actor_id: UUID, type: str, post_id: UUID | None = None) -> Notification:
    raise NotImplementedError


def get_notifications(db: Session, user: User) -> list[Notification]:
    raise NotImplementedError


def mark_read(db: Session, user: User) -> None:
    raise NotImplementedError
