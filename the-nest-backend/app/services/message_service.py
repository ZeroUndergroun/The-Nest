from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.message import DirectMessage
from app.models.user import User


def list_conversations(db: Session, user: User) -> list[dict]:
    msgs = (
        db.query(DirectMessage)
        .filter(
            or_(
                DirectMessage.sender_id == user.id,
                DirectMessage.recipient_id == user.id,
            )
        )
        .order_by(DirectMessage.created_at.desc())
        .all()
    )
    seen: dict = {}
    for msg in msgs:
        other_id = msg.recipient_id if msg.sender_id == user.id else msg.sender_id
        if other_id not in seen:
            other = db.query(User).filter(User.id == other_id).first()
            if not other:
                continue
            unread = db.query(DirectMessage).filter(
                DirectMessage.sender_id == other_id,
                DirectMessage.recipient_id == user.id,
                DirectMessage.is_read == False,
            ).count()
            seen[other_id] = {
                "other_user": {
                    "username": other.username,
                    "display_name": other.display_name,
                    "avatar_url": other.avatar_url,
                },
                "latest_message": msg.content,
                "latest_at": msg.created_at,
                "unread_count": unread,
            }
    return list(seen.values())


def get_conversation(db: Session, user: User, other_username: str) -> list[DirectMessage]:
    other = db.query(User).filter(User.username == other_username).first()
    if not other:
        raise HTTPException(status_code=404, detail="User not found")
    msgs = (
        db.query(DirectMessage)
        .filter(
            or_(
                and_(DirectMessage.sender_id == user.id, DirectMessage.recipient_id == other.id),
                and_(DirectMessage.sender_id == other.id, DirectMessage.recipient_id == user.id),
            )
        )
        .order_by(DirectMessage.created_at.asc())
        .all()
    )
    for msg in msgs:
        if msg.recipient_id == user.id and not msg.is_read:
            msg.is_read = True
    db.commit()
    return msgs


def send_message(db: Session, sender: User, recipient_username: str, content: str) -> DirectMessage:
    recipient = db.query(User).filter(User.username == recipient_username).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="User not found")
    if recipient.id == sender.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")
    msg = DirectMessage(sender_id=sender.id, recipient_id=recipient.id, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def delete_message(db: Session, user: User, message_id: UUID) -> None:
    msg = db.query(DirectMessage).filter(DirectMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    if msg.sender_id != user.id:
        raise HTTPException(status_code=403, detail="Not your message")
    db.delete(msg)
    db.commit()
