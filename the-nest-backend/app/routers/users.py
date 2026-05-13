import httpx
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.post import Post
from app.models.repost import Repost as RepostModel
from app.models.user import User
from app.schemas.user import UserPublicProfile, UserResponse, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/api/users", tags=["users"])

# /search, /me, and /me/avatar must come before /{username} to prevent path param conflicts


@router.get("/search")
def search_users(q: str = Query(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_service.search_users(db, q)


@router.patch("/me", response_model=UserResponse)
def update_me(body: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_service.update_profile(db, current_user, body.display_name, body.bio, body.avatar_url)


@router.post("/me/avatar", response_model=UserResponse)
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not settings.supabase_url or not settings.supabase_service_key:
        raise HTTPException(status_code=503, detail="Avatar upload not configured")

    contents = file.file.read()
    ext = (file.filename or "jpg").rsplit(".", 1)[-1].lower()
    if ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
        raise HTTPException(status_code=400, detail="Unsupported image format")

    path = f"{current_user.id}.{ext}"
    with httpx.Client() as client:
        res = client.put(
            f"{settings.supabase_url}/storage/v1/object/avatars/{path}",
            content=contents,
            headers={
                "Authorization": f"Bearer {settings.supabase_service_key}",
                "Content-Type": file.content_type or "image/jpeg",
                "x-upsert": "true",
            },
        )
    if res.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="Upload failed")

    avatar_url = f"{settings.supabase_url}/storage/v1/object/public/avatars/{path}"
    return user_service.update_profile(db, current_user, None, None, avatar_url)


@router.get("/{username}", response_model=UserPublicProfile)
def get_profile(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_service.get_public_profile(db, username, current_user.id)


@router.get("/{username}/posts")
def get_user_posts(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = user_service.get_profile(db, username)

    original = (
        db.query(Post)
        .filter(Post.user_id == user.id, Post.is_reply == False)
        .order_by(Post.created_at.desc())
        .limit(50)
        .all()
    )

    reposts_q = (
        db.query(Post, RepostModel.created_at.label("reposted_at"))
        .join(RepostModel, RepostModel.post_id == Post.id)
        .filter(RepostModel.user_id == user.id)
        .order_by(RepostModel.created_at.desc())
        .limit(50)
        .all()
    )

    def serialize(post, reposted_by=None, sort_key=None):
        return {
            "id": str(post.id),
            "user_id": str(post.user_id),
            "content": post.content,
            "parent_post_id": str(post.parent_post_id) if post.parent_post_id else None,
            "is_reply": post.is_reply,
            "like_count": post.like_count,
            "reply_count": post.reply_count,
            "repost_count": post.repost_count,
            "created_at": post.created_at,
            "reposted_by": reposted_by,
            "user": {
                "username": post.user.username,
                "display_name": post.user.display_name,
                "avatar_url": post.user.avatar_url,
                "role": post.user.role.value if hasattr(post.user.role, "value") else str(post.user.role),
            } if post.user else None,
            "_sort": sort_key or post.created_at,
        }

    by_id: dict = {}
    for item in [serialize(p) for p in original]:
        by_id[item["id"]] = item
    for item in [serialize(p, reposted_by=user.username, sort_key=rt) for p, rt in reposts_q]:
        by_id[item["id"]] = item  # repost entry wins on conflict

    result = sorted(by_id.values(), key=lambda x: x["_sort"], reverse=True)
    for item in result:
        del item["_sort"]

    return result[:20]


@router.get("/{username}/replies")
def get_user_replies(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = user_service.get_profile(db, username)
    return (
        db.query(Post)
        .filter(Post.user_id == user.id, Post.is_reply == True)
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
