import re
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.hashtag import Hashtag, PostHashtag
from app.models.post import Post


def parse_and_link_hashtags(db: Session, post_id: UUID, content: str) -> None:
    tags = set(tag.lower() for tag in re.findall(r'#(\w+)', content))
    if not tags:
        return
    for tag in tags:
        hashtag = db.query(Hashtag).filter(Hashtag.tag == tag).first()
        if not hashtag:
            hashtag = Hashtag(tag=tag, usage_count=1)
            db.add(hashtag)
            db.flush()
        else:
            hashtag.usage_count += 1
            db.flush()
        db.add(PostHashtag(post_id=post_id, hashtag_id=hashtag.id))
    db.commit()


def get_trending(db: Session) -> list[Hashtag]:
    return (
        db.query(Hashtag)
        .filter(Hashtag.usage_count > 0)
        .order_by(Hashtag.usage_count.desc())
        .limit(10)
        .all()
    )


def get_posts_by_hashtag(db: Session, tag: str, page: int = 1) -> list[Post]:
    hashtag = db.query(Hashtag).filter(Hashtag.tag == tag.lower()).first()
    if not hashtag:
        return []
    return (
        db.query(Post)
        .join(PostHashtag, PostHashtag.post_id == Post.id)
        .filter(PostHashtag.hashtag_id == hashtag.id)
        .order_by(Post.created_at.desc())
        .offset((page - 1) * 20)
        .limit(20)
        .all()
    )
