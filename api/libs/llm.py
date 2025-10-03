from sqlalchemy.orm import Session
from libs.db import SessionLocal
from schemas.models import Setting

def load_setting(db: Session):
    print("Loading settings from DB...")
    s = db.query(Setting).first()

    if not s:
        s = Setting(
            isLocal=False,
            isApi=True,
            apiKey="test-api-key",
            modelName="mock-llm",
            temperature=0.7,
            systemPrompt="You are a test assistant."
        )
        db.add(s)
    else:
        s.isLocal = False
        s.isApi = True
        s.apiKey = "test-api-key"
        s.modelName = "mock-llm"
        s.temperature = 0.7
        s.systemPrompt = "You are a test assistant."

    db.commit()
    db.refresh(s)
    print("Settings loaded:", s)
    return s


def get_llm_response(prompt: str) -> str:
    db = SessionLocal()
    setting = load_setting(db)
    print(setting.modelName, setting.isLocal, setting.isApi)

    if setting.isLocal:
        return "Local model response to: " + prompt

    elif setting.isApi:
        return f"API model ({setting.modelName}) response to: " + prompt

    else:
        return "⚠️ No model configured"
