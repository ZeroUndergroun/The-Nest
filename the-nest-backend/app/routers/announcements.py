from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_admin_user, get_current_user
from app.models.announcement import Announcement
from app.models.user import User

router = APIRouter(prefix="/api/announcements", tags=["announcements"])

VALID_TAGS = {"Announcement", "Event", "Deadline"}


class AnnouncementCreate(BaseModel):
    tag: str
    title: str
    date: str
    description: Optional[str] = None


class AnnouncementSubmit(BaseModel):
    tag: str
    title: str
    date: str
    description: Optional[str] = None


class AnnouncementResponse(BaseModel):
    id: UUID
    tag: str
    title: str
    date: str
    description: Optional[str]
    is_approved: bool
    submitted_by: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


def _validate(tag: str, title: str, date: str) -> None:
    if tag not in VALID_TAGS:
        raise HTTPException(status_code=400, detail=f"tag must be one of {sorted(VALID_TAGS)}")
    if not title.strip():
        raise HTTPException(status_code=400, detail="title is required")
    if not date.strip():
        raise HTTPException(status_code=400, detail="date is required")


@router.get("/", response_model=list[AnnouncementResponse])
def list_announcements(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Announcement)
        .filter(Announcement.is_approved == True)
        .order_by(Announcement.created_at.desc())
        .all()
    )


@router.get("/pending", response_model=list[AnnouncementResponse])
def list_pending(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return (
        db.query(Announcement)
        .filter(Announcement.is_approved == False)
        .order_by(Announcement.created_at.desc())
        .all()
    )


@router.post("/", response_model=AnnouncementResponse)
def create_announcement(
    body: AnnouncementCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    _validate(body.tag, body.title, body.date)
    item = Announcement(
        tag=body.tag,
        title=body.title.strip(),
        date=body.date.strip(),
        description=body.description.strip() if body.description else None,
        is_approved=True,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/submit", response_model=AnnouncementResponse)
def submit_petition(
    body: AnnouncementSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _validate(body.tag, body.title, body.date)
    item = Announcement(
        tag=body.tag,
        title=body.title.strip(),
        date=body.date.strip(),
        description=body.description.strip() if body.description else None,
        is_approved=False,
        submitted_by=current_user.username,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/{announcement_id}/approve", response_model=AnnouncementResponse)
def approve_announcement(
    announcement_id: UUID,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    item = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Announcement not found")
    item.is_approved = True
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{announcement_id}", status_code=204)
def delete_announcement(
    announcement_id: UUID,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    item = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(item)
    db.commit()
