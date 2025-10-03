from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from libs.db import SessionLocal
from schemas.models import ChatRoom, UserAccount
from router.auth import get_current_user 

router = APIRouter(prefix="/chat", tags=["chat"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create-room")
def create_room(
    roomName: str,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)  
):

    existing = (
        db.query(ChatRoom)
        .filter(ChatRoom.roomName == roomName, ChatRoom.username == current_user.username)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room already exists for this user"
        )

    # Create new room tied to current_user
    room = ChatRoom(roomName=roomName, username=current_user.username)
    db.add(room)
    db.commit()
    db.refresh(room)

    return {
        "id": room.id,
        "roomName": room.roomName,
        "owner": current_user.username
    }
