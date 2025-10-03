from fastapi import FastAPI
from libs.db import init_db
from router import auth, chat, ws_chat, ui  

app = FastAPI()
init_db()

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(ws_chat.router)
app.include_router(ui.router)  
