import uuid
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
    current_user: UserAccount = Depends(get_current_user),
):
    existing = (
        db.query(ChatRoom)
        .filter(ChatRoom.roomName == roomName, ChatRoom.username == current_user.username)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room already exists for this user",
        )

    room = ChatRoom(roomName=roomName, username=current_user.username)
    db.add(room)
    db.commit()
    db.refresh(room)
    return {
        "id": str(room.id), 
        "roomName": room.roomName,
        "owner": current_user.username,
    }


@router.get("/rooms")
def get_rooms(
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user),
):
    rooms = db.query(ChatRoom).filter(ChatRoom.username == current_user.username).all()
    return [
        {"id": str(r.id), "roomName": r.roomName, "owner": r.username} for r in rooms
    ]


@router.get("/room/{room_id}")
def get_room(
    room_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user),
):
    room = (
        db.query(ChatRoom)
        .filter(ChatRoom.id == room_id, ChatRoom.username == current_user.username)
        .first()
    )
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"id": str(room.id), "roomName": room.roomName, "owner": room.username}


@router.put("/room/{room_id}")
def update_room(
    room_id: uuid.UUID, 
    new_name: str,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user),
):
    room = (
        db.query(ChatRoom)
        .filter(ChatRoom.id == room_id, ChatRoom.username == current_user.username)
        .first()
    )
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    duplicate = (
        db.query(ChatRoom)
        .filter(ChatRoom.roomName == new_name, ChatRoom.username == current_user.username)
        .first()
    )
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A room with this name already exists",
        )

    room.roomName = new_name
    db.commit()
    db.refresh(room)
    return {"id": str(room.id), "roomName": room.roomName, "owner": room.username}


@router.delete("/room/{room_id}")
def delete_room(
    room_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user),
):
    room = (
        db.query(ChatRoom)
        .filter(ChatRoom.id == room_id, ChatRoom.username == current_user.username)
        .first()
    )
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    db.delete(room)
    db.commit()
    return {"message": "Room deleted successfully"}
