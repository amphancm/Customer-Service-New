from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from libs.db import SessionLocal
from libs.llm import get_llm_response
from schemas.models import Conversation, ChatRoom, Message, UserAccount
from router.auth import get_current_user

router = APIRouter(prefix="/ws", tags=["websocket"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.websocket("/chat/{room_id}/{username}")
async def websocket_endpoint(websocket: WebSocket, room_id: int, username: str, db: Session = Depends(get_db)):
    user = db.query(UserAccount).filter(UserAccount.username == username).first()
    if not user:
        await websocket.accept()
        await websocket.send_text("❌ Error: User does not exist")
        await websocket.close()
        return
    room = db.query(ChatRoom).filter(ChatRoom.id == room_id, ChatRoom.username == username).first()
    if not room:
        await websocket.accept()
        await websocket.send_text("❌ Error: ChatRoom does not exist or does not belong to this user")
        await websocket.close()
        return

    await websocket.accept()
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()

            # Save Conversation entry
            convo = Conversation(chatRoom_id=room_id, query=data, responseMessage="")
            db.add(convo)
            db.commit()
            db.refresh(convo)

            # Get LLM response
            response = get_llm_response(data)
            convo.responseMessage = response
            db.commit()

            # Save Message (sender is the user)
            msg = Message(conversation_id=convo.id, senderUsername=username, rating=None)
            db.add(msg)
            db.commit()

            # Send back LLM response
            await websocket.send_text(response)

    except WebSocketDisconnect:
        print(f"Room {room_id} (user={username}): client disconnected")
