from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from libs.db import SessionLocal
from schemas.models import ChatRoom, UserAccount
from router.auth import get_current_user  # your JWT dependency

router = APIRouter(prefix="/room", tags=["room"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create")
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

    room = ChatRoom(roomName=roomName, username=current_user.username)
    db.add(room)
    db.commit()
    db.refresh(room)

    return {
        "message": "Chat room created successfully",
        "data": {"id": room.id, "roomName": room.roomName, "owner": room.username}
    }


@router.get("/list")
def list_rooms(
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    rooms = db.query(ChatRoom).filter(ChatRoom.username == current_user.username).all()
    return {
        "data": [{"id": r.id, "roomName": r.roomName} for r in rooms]
    }


@router.get("/{room_id}")
def get_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    room = (
        db.query(ChatRoom)
        .filter(ChatRoom.id == room_id, ChatRoom.username == current_user.username)
        .first()
    )
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    return {
        "data": {"id": room.id, "roomName": room.roomName, "owner": room.username}
    }


@router.put("/{room_id}")
def update_room(
    room_id: int,
    newName: str,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    room = (
        db.query(ChatRoom)
        .filter(ChatRoom.id == room_id, ChatRoom.username == current_user.username)
        .first()
    )
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    # check if newName already taken by this user
    duplicate = (
        db.query(ChatRoom)
        .filter(ChatRoom.roomName == newName, ChatRoom.username == current_user.username)
        .first()
    )
    if duplicate:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Room name already exists")

    room.roomName = newName
    db.commit()
    db.refresh(room)

    return {
        "message": "Chat room updated successfully",
        "data": {"id": room.id, "roomName": room.roomName}
    }


@router.delete("/{room_id}")
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    room = (
        db.query(ChatRoom)
        .filter(ChatRoom.id == room_id, ChatRoom.username == current_user.username)
        .first()
    )
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    db.delete(room)
    db.commit()

    return {
        "message": f"Chat room '{room.roomName}' deleted successfully"
    }
