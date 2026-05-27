from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.follow import Follow
from app.models.post import Post
from app.models.user import User


def _engagement_score(post: Post) -> float:
    engagement = post.like_count + post.repost_count * 2 + post.reply_count * 1.5
    created = post.created_at.replace(tzinfo=timezone.utc) if post.created_at.tzinfo is None else post.created_at
    age_hours = (datetime.now(timezone.utc) - created).total_seconds() / 3600
    decay = 0.5 if age_hours > 48 else 1.0
    return engagement * decay


def get_discover_feed(db: Session, page: int = 1, page_size: int = 20) -> list[Post]:
    # Fetch a larger candidate pool and rank by engagement
    candidates = (
        db.query(Post)
        .filter(Post.is_reply == False)
        .order_by(Post.created_at.desc())
        .limit(100)
        .all()
    )
    ranked = sorted(candidates, key=_engagement_score, reverse=True)
    start = (page - 1) * page_size
    return ranked[start: start + page_size]


def get_home_feed(db: Session, user: User, page: int = 1, page_size: int = 20) -> list[Post]:
    following_ids = [
        row.following_id
        for row in db.query(Follow.following_id).filter(Follow.follower_id == user.id).all()
    ]
    following_ids.append(user.id)

    return (
        db.query(Post)
        .filter(Post.user_id.in_(following_ids), Post.is_reply == False)
        .order_by(Post.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
