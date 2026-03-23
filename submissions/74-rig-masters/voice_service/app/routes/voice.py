from fastapi import APIRouter
from app.models.voice_model import VoiceRequest
from app.services.voice_agent import process_voice_text

router = APIRouter()

@router.post("/voice")
async def voice_endpoint(req: VoiceRequest):
    result = await process_voice_text(req.text)
    return {
        "input": req.text,
        "output": result
    }