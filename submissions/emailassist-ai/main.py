from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn

app = FastAPI()

# --- Data Models ---

class EmailInput(BaseModel):
    email_id: str
    subject: str
    sender_name: str
    sender_email: str
    body: str
    timestamp: str

class ProcessEmailsRequest(BaseModel):
    emails: List[EmailInput]
    user_name: str
    user_email: str

class GenerateReplyRequest(BaseModel):
    email_id: str
    subject: str
    sender_name: str
    body: str
    tone: str
    user_name: str
    custom_instruction: Optional[str] = ""

# --- Endpoints ---

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/process-emails")
async def process_emails(request: ProcessEmailsRequest):
    print(f"[{datetime.now()}] Incoming /process-emails request:")
    print(f"  User: {request.user_name} ({request.user_email})")
    print(f"  Number of emails: {len(request.emails)}")
    # Optional: Print first email subject for more context
    if request.emails:
        print(f"  First email subject: {request.emails[0].subject}")
    processed = []
    for email in request.emails:
        # Generate a mock summary and priority based on keywords
        is_meeting = any(kw in email.subject.lower() or kw in email.body.lower() 
                        for kw in ["meeting", "kickoff", "call", "zoom", "schedule"])
        
        priority_level = "requires_action" if is_meeting else "fyi"
        if "urgent" in email.subject.lower() or "asap" in email.body.lower():
            priority_level = "urgent"

        # Mock AI results matching the spec exactly
        item = {
            "email_id": email.email_id,
            "summary": f"This is a mock summary for: {email.subject}. It mentions {email.sender_name} and seems to be about {email.body[:50]}...",
            "priority": {
                "level": priority_level,
                "reasons": [
                    "Detected actionable intent" if is_meeting else "General information",
                    "High importance keywords found" if priority_level == "urgent" else "Standard priority"
                ]
            },
            "intent": "meeting_request" if is_meeting else "general_communication",
            "has_meeting": is_meeting,
            "has_tasks": True,  # Hardcoding tasks for demo
            "suggested_reply": {
                "subject": f"Re: {email.subject}",
                "body": f"Hi {email.sender_name},\n\nThanks for your email regarding '{email.subject}'. I have received your message and will get back to you shortly.\n\nBest regards,\n{request.user_name}"
            },
            "calendar_event": {
                "title": f"Meeting: {email.subject}",
                "date": "2024-01-25", # Hardcoded mock date
                "time": "10:00",      # Hardcoded mock time
                "participants": [email.sender_email, request.user_email],
                "description": f"Scheduled meeting based on email: {email.subject}"
            } if is_meeting else None,
            "tasks": [
                {
                    "title": f"Follow up with {email.sender_name}",
                    "deadline": "2024-01-26",
                    "priority": "medium"
                },
                {
                    "title": "Review internal docs",
                    "deadline": None,
                    "priority": "low"
                }
            ]
        }
        processed.append(item)
        
    return {"processed": processed}

@app.post("/generate-reply")
async def generate_reply(request: GenerateReplyRequest):
    print(f"[{datetime.now()}] Incoming /generate-reply request:")
    print(f"  User: {request.user_name}")
    print(f"  Email ID: {request.email_id}")
    print(f"  Requested Tone: {request.tone}")
    if request.custom_instruction:
        print(f"  Custom Instruction: {request.custom_instruction}")
    tones = {
        "formal": "Dear {name},\n\nThank you for your message. I am currently reviewing the details and will provide a formal response soon.\n\nSincerely,\n{user}",
        "friendly": "Hi {name}!\n\nGreat to hear from you. I'm on it and will send over more info in a bit!\n\nBest,\n{user}",
        "assertive": "Hello {name},\n\nI have received your request. Let's move forward with the next steps as discussed. I'll follow up by EOD.\n\nRegards,\n{user}"
    }
    
    selected_tone = request.tone.lower()
    template = tones.get(selected_tone, tones["formal"])
    
    reply_body = template.format(name=request.sender_name, user=request.user_name)
    
    if request.custom_instruction:
        reply_body += f"\n\nNote: {request.custom_instruction}"
        
    return {
        "email_id": request.email_id,
        "reply": {
            "subject": f"Re: {request.subject}",
            "body": reply_body
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
