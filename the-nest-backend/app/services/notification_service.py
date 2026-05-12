from uuid import UUID

from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user import User


def create_notification(
    db: Session,
    recipient_id: UUID,
    actor_id: UUID,
    type: str,
    post_id: UUID | None = None,
) -> None:
    if recipient_id == actor_id:
        return
    db.add(Notification(
        recipient_id=recipient_id,
        actor_id=actor_id,
        type=type,
        post_id=post_id,
    ))
    db.commit()


def get_notifications(db: Session, user: User) -> list[dict]:
    notifs = (
        db.query(Notification)
        .filter(Notification.recipient_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    result = []
    for n in notifs:
        actor = db.query(User).filter(User.id == n.actor_id).first()
        if not actor:
            continue
        result.append({
            "id": n.id,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at,
            "post_id": n.post_id,
            "actor": {
                "username": actor.username,
                "display_name": actor.display_name,
                "avatar_url": actor.avatar_url,
            },
        })
    return result


def mark_read(db: Session, user: User) -> None:
    db.query(Notification).filter(
        Notification.recipient_id == user.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()


def get_unread_count(db: Session, user: User) -> int:
    return db.query(Notification).filter(
        Notification.recipient_id == user.id,
        Notification.is_read == False,
    ).count()
