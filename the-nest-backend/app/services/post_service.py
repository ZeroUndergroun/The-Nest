from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.like import Like
from app.models.post import Post
from app.models.repost import Repost
from app.models.user import User


def create_post(db: Session, user: User, content: str, parent_post_id: UUID | None = None) -> Post:
    is_reply = parent_post_id is not None

    if is_reply:
        parent = db.query(Post).filter(Post.id == parent_post_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Post not found")

    post = Post(
        user_id=user.id,
        content=content,
        parent_post_id=parent_post_id,
        is_reply=is_reply,
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    if is_reply:
        parent.reply_count += 1
        db.commit()

    return post


def get_post(db: Session, post_id: UUID) -> Post:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


def delete_post(db: Session, user: User, post_id: UUID) -> None:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your post")
    db.delete(post)
    db.commit()


def toggle_like(db: Session, user: User, post_id: UUID) -> dict:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = db.query(Like).filter(Like.user_id == user.id, Like.post_id == post_id).first()

    if existing:
        db.delete(existing)
        post.like_count = max(0, post.like_count - 1)
        db.commit()
        return {"liked": False, "like_count": post.like_count}
    else:
        db.add(Like(user_id=user.id, post_id=post_id))
        post.like_count += 1
        db.commit()
        return {"liked": True, "like_count": post.like_count}


def toggle_repost(db: Session, user: User, post_id: UUID) -> dict:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = db.query(Repost).filter(Repost.user_id == user.id, Repost.post_id == post_id).first()

    if existing:
        db.delete(existing)
        post.repost_count = max(0, post.repost_count - 1)
        db.commit()
        return {"reposted": False, "repost_count": post.repost_count}
    else:
        db.add(Repost(user_id=user.id, post_id=post_id))
        post.repost_count += 1
        db.commit()
        return {"reposted": True, "repost_count": post.repost_count}
