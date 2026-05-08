from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/hashtags", tags=["hashtags"])

# /trending must come before /{tag} to prevent path param conflict


@router.get("/trending")
def get_trending(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    raise NotImplementedError


@router.get("/{tag}")
def get_posts_by_hashtag(tag: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    raise NotImplementedError
