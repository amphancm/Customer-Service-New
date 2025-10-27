from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from libs.db import init_db
from router import auth, chat, ws_chat, ui, setting, document
from dependency import get_db
from router.auth import get_user, get_password_hash
from schemas.models import UserAccount, Setting
from sqlalchemy.orm import Session

app = FastAPI()
init_db()

# Create default user
# def create_default_user():
#     with get_db() as db:
#         if not get_user(db, "admin"):
#             init_setting = Setting()
#             db.add(init_setting)
#             db.commit()
#             db.refresh(init_setting)

#             new_user = UserAccount(
#                 username="admin",
#                 password=get_password_hash("password"),
#                 setting_id=init_setting.id
#             )
#             db.add(new_user)
#             db.commit()
#             db.refresh(new_user)

# create_default_user()

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
app.include_router(document.router)
