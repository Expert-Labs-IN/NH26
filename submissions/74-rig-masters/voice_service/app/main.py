from fastapi import FastAPI
from pydantic import BaseModel
from app.services.voice_agent import process_voice_text
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Voice Recognition API is running"}

class VoiceRequest(BaseModel):
    text: str

@app.post("/voice")
async def voice(req: VoiceRequest):
    result = await process_voice_text(req.text)
    return {
        "input": req.text,
        "output": result
    }
