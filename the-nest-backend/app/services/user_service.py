from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.follow import Follow
from app.models.user import User


def get_public_profile(db: Session, username: str) -> dict:
    user = get_profile(db, username)
    follower_count = db.query(Follow).filter(Follow.following_id == user.id).count()
    following_count = db.query(Follow).filter(Follow.follower_id == user.id).count()
    return {
        "username": user.username,
        "display_name": user.display_name,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "role": user.role,
        "created_at": user.created_at,
        "follower_count": follower_count,
        "following_count": following_count,
    }


def get_profile(db: Session, username: str) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def update_profile(db: Session, user: User, display_name: str | None, bio: str | None, avatar_url: str | None) -> User:
    if display_name is not None:
        user.display_name = display_name
    if bio is not None:
        user.bio = bio
    if avatar_url is not None:
        user.avatar_url = avatar_url
    db.commit()
    db.refresh(user)
    return user


def toggle_follow(db: Session, follower: User, username: str) -> dict:
    target = db.query(User).filter(User.username == username).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    if target.id == follower.id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")

    existing = db.query(Follow).filter(
        Follow.follower_id == follower.id,
        Follow.following_id == target.id,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"following": False}
    else:
        db.add(Follow(follower_id=follower.id, following_id=target.id))
        db.commit()
        return {"following": True}


def search_users(db: Session, query: str) -> list[User]:
    return (
        db.query(User)
        .filter(
            or_(
                User.username.ilike(f"%{query}%"),
                User.display_name.ilike(f"%{query}%"),
            )
        )
        .limit(20)
        .all()
    )


def get_followers(db: Session, username: str) -> list[User]:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return (
        db.query(User)
        .join(Follow, Follow.follower_id == User.id)
        .filter(Follow.following_id == user.id)
        .all()
    )


def get_following(db: Session, username: str) -> list[User]:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return (
        db.query(User)
        .join(Follow, Follow.following_id == User.id)
        .filter(Follow.follower_id == user.id)
        .all()
    )
