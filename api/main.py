from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from libs.db import init_db
from router import auth, chat, ws_chat, ui, setting

app = FastAPI()
init_db()

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(ws_chat.router)
app.include_router(ui.router)  
app.include_router(setting.router)
