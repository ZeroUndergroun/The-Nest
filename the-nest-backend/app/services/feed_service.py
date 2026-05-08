from sqlalchemy.orm import Session

from app.models.follow import Follow
from app.models.post import Post
from app.models.user import User


def get_discover_feed(db: Session, page: int = 1, page_size: int = 20) -> list[Post]:
    return (
        db.query(Post)
        .filter(Post.is_reply == False)
        .order_by(Post.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )


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
