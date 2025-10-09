import requests
from sqlalchemy.orm import Session
from libs.db import SessionLocal
from schemas.models import Setting

def load_setting(db: Session):
    return db.query(Setting).first()

def get_llm_response(prompt: str) -> str:
    db = SessionLocal()
    try:
        setting = load_setting(db)
        if not setting:
            return "❌ No setting found"

        print(f"""
        Current Setting:
        isLocal: {setting.isLocal}
        isApi: {setting.isApi}
        domainName: {setting.domainName}
        modelName: {setting.modelName}
        temperature: {setting.temperature}
        systemPrompt: {setting.systemPrompt}
        """)

        # 🧠 Local model
        if setting.isLocal:
            return f"Local model response to: {prompt}"

        # 🌐 API model (Together AI)
        elif setting.isApi and setting.domainName == "togetherai":
            url = "https://api.together.xyz/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {setting.apiKey}",
                "Content-Type": "application/json",
            }

            messages = []
            if setting.systemPrompt:
                messages.append({"role": "system", "content": setting.systemPrompt})

            messages.append({"role": "user", "content": prompt})

            payload = {
                "model": setting.modelName,
                "messages": messages,
                "temperature": setting.temperature or 0.7,
                "max_tokens": 512
            }

            response = requests.post(url, headers=headers, json=payload)
            if response.status_code != 200:
                return f"❌ API Error: {response.text}"

            data = response.json()
            return data["choices"][0]["message"]["content"]

        else:
            return "⚠️ No model configured"
    finally:
        db.close()
