from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.post import PostCreate, PostWithAuthor
from app.services import feed_service, post_service

router = APIRouter(prefix="/api/posts", tags=["posts"])


@router.get("/feed", response_model=list[PostWithAuthor])
def get_feed(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return feed_service.get_home_feed(db, current_user)


@router.get("/discover", response_model=list[PostWithAuthor])
def get_discover(page: int = 1, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return feed_service.get_discover_feed(db, page=page)


@router.post("/", response_model=PostWithAuthor, status_code=201)
def create_post(body: PostCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return post_service.create_post(db, current_user, body.content, body.parent_post_id)


@router.get("/{post_id}", response_model=PostWithAuthor)
def get_post(post_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return post_service.get_post(db, post_id)


@router.delete("/{post_id}", status_code=204)
def delete_post(post_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post_service.delete_post(db, current_user, post_id)


@router.post("/{post_id}/like")
def like_post(post_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return post_service.toggle_like(db, current_user, post_id)


@router.post("/{post_id}/repost")
def repost(post_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return post_service.toggle_repost(db, current_user, post_id)


@router.get("/{post_id}/replies", response_model=list[PostWithAuthor])
def get_replies(post_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.post import Post as PostModel
    return (
        db.query(PostModel)
        .filter(PostModel.parent_post_id == post_id)
        .order_by(PostModel.created_at.asc())
        .all()
    )


@router.post("/{post_id}/reply", response_model=PostWithAuthor, status_code=201)
def reply(post_id: UUID, body: PostCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return post_service.create_post(db, current_user, body.content, parent_post_id=post_id)
