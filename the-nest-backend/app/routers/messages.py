from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.get("/")
def list_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    raise NotImplementedError


@router.get("/{username}")
def get_conversation(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    raise NotImplementedError


@router.post("/{username}", response_model=MessageResponse, status_code=201)
def send_message(username: str, body: MessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    raise NotImplementedError


@router.delete("/{message_id}", status_code=204)
def delete_message(message_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    raise NotImplementedError
