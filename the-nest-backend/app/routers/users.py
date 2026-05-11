from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.post import Post
from app.models.user import User
from app.schemas.user import UserPublicProfile, UserResponse, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/api/users", tags=["users"])

# /search and /me must come before /{username} to prevent path param conflicts


@router.get("/search")
def search_users(q: str = Query(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_service.search_users(db, q)


@router.patch("/me", response_model=UserResponse)
def update_me(body: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_service.update_profile(db, current_user, body.display_name, body.bio, body.avatar_url)


@router.get("/{username}", response_model=UserPublicProfile)
def get_profile(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_service.get_public_profile(db, username, current_user.id)


@router.get("/{username}/posts")
def get_user_posts(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = user_service.get_profile(db, username)
    return (
        db.query(Post)
        .filter(Post.user_id == user.id, Post.is_reply == False)
        .order_by(Post.created_at.desc())
        .limit(20)
        .all()
    )


@router.post("/{username}/follow")
def follow(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_service.toggle_follow(db, current_user, username)


@router.get("/{username}/followers")
def get_followers(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_service.get_followers(db, username)


@router.get("/{username}/following")
def get_following(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_service.get_following(db, username)
