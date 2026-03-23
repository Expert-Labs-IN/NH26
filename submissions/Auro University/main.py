"""
POST /process-emails
Single-file FastAPI endpoint: Groq LLM analysis + Supermemory storage.
"""
import asyncio
import json
import os
from contextlib import asynccontextmanager
from typing import List, Literal, Optional

from dotenv import load_dotenv
load_dotenv()  # Must run before initialising clients

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel, Field
from supermemory import Supermemory


# ── Pydantic Models ────────────────────────────────────────────────────────────

class EmailItem(BaseModel):
    email_id: str
    subject: str
    sender_name: str
    sender_email: str
    body: str
    timestamp: str


class ProcessEmailsRequest(BaseModel):
    emails: List[EmailItem]
    user_name: str
    user_email: str


class Priority(BaseModel):
    level: Literal["requires_action", "informational", "low"]
    reasons: List[str]


class SuggestedReply(BaseModel):
    subject: str
    body: str


class CalendarEvent(BaseModel):
    title: str
    date: str           # YYYY-MM-DD
    time: str           # HH:MM
    participants: List[str]
    description: str


class Task(BaseModel):
    title: str
    deadline: Optional[str] = None   # YYYY-MM-DD or null
    priority: Literal["high", "medium", "low"]


class ProcessedEmail(BaseModel):
    email_id: str
    summary: str
    priority: Priority
    intent: str
    has_meeting: bool
    has_tasks: bool
    suggested_reply: SuggestedReply
    calendar_event: Optional[CalendarEvent] = None
    tasks: List[Task] = Field(default_factory=list)


class ProcessEmailsResponse(BaseModel):
    processed: List[ProcessedEmail]


# ── Generate Reply Models ──────────────────────────────────────────────────────

class GenerateReplyRequest(BaseModel):
    email_id: str
    subject: str
    sender_name: str
    body: str
    tone: Literal["professional", "friendly", "formal", "concise"] = "professional"
    user_name: str
    user_email: str
    custom_instruction: Optional[str] = None


class ReplyContent(BaseModel):
    subject: str
    body: str


class GenerateReplyResponse(BaseModel):
    email_id: str
    reply: ReplyContent


# ── Clients ────────────────────────────────────────────────────────────────────

groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])
memory_client = Supermemory(api_key=os.environ["SUPERMEMORY_API_KEY"])


def sanitize_tag(user_email: str) -> str:
    """Convert an email address to a valid Supermemory container_tag.
    Supermemory only allows: alphanumeric, hyphens, underscores, colons.
    e.g. sarah@gmail.com  →  sarah_at_gmail_com
    """
    return user_email.replace("@", "_at_").replace(".", "_")

GROQ_MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are an intelligent email assistant. Analyse the email provided and return ONLY a JSON object — no markdown, no preamble, no trailing text.

The JSON must follow this exact schema:
{
  "email_id": "<string>",
  "summary": "<one-sentence summary of the email>",
  "priority": {
    "level": "<requires_action | informational | low>",
    "reasons": ["<reason 1>", "..."]
  },
  "intent": "<single label: meeting_request | follow_up | information | action_required | introduction | other>",
  "has_meeting": <true|false>,
  "has_tasks": <true|false>,
  "suggested_reply": {
    "subject": "<reply subject>",
    "body": "<polite, professional reply body>"
  },
  "calendar_event": <null if no meeting, otherwise {
    "title": "<event title>",
    "date": "<YYYY-MM-DD>",
    "time": "<HH:MM>",
    "participants": ["<email1>", "..."],
    "description": "<short description>"
  }>,
  "tasks": [
    {
      "title": "<task title>",
      "deadline": "<YYYY-MM-DD or null>",
      "priority": "<high | medium | low>"
    }
  ]
}

Rules:
- Set has_meeting=true only when a specific meeting is proposed or confirmed.
- Set has_tasks=true only when explicit action items are required from the recipient.
- tasks array may be empty [].
- calendar_event must be null when has_meeting is false.
- Use the recipient's name in the suggested_reply signature.
- All dates must be real calendar dates inferred from context; if the year is ambiguous, use the email timestamp year.
"""


# ── Core Logic ─────────────────────────────────────────────────────────────────

def analyze_email(
    email: EmailItem,
    user_name: str,
    user_email: str,
    memory_context: str = "",
) -> ProcessedEmail:
    """Call Groq with JSON mode and parse into a ProcessedEmail model."""
    system = SYSTEM_PROMPT
    if memory_context:
        system += f"\n\n--- User memory context ---\n{memory_context}"

    user_prompt = (
        f"Recipient name: {user_name}\n"
        f"Recipient email: {user_email}\n\n"
        f"Email ID: {email.email_id}\n"
        f"Subject: {email.subject}\n"
        f"From: {email.sender_name} <{email.sender_email}>\n"
        f"Timestamp: {email.timestamp}\n\n"
        f"Body:\n{email.body}"
    )

    response = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    data = json.loads(response.choices[0].message.content)
    data["email_id"] = email.email_id  # Always trust the input ID
    return ProcessedEmail.model_validate(data)


def store_email_memory(email: EmailItem, user_email: str) -> None:
    """Store email in Supermemory under the user's container_tag."""
    content = (
        f"Email ID: {email.email_id}\n"
        f"Subject: {email.subject}\n"
        f"From: {email.sender_name} <{email.sender_email}>\n"
        f"Timestamp: {email.timestamp}\n\n"
        f"{email.body}"
    )
    memory_client.add(content=content, container_tag=sanitize_tag(user_email))


def process_single(email: EmailItem, user_name: str, user_email: str) -> ProcessedEmail:
    """Retrieve memory context → LLM analysis → store email."""
    # 1. Pull user profile + relevant memories before calling the LLM
    memory_context = ""
    try:
        profile = memory_client.profile(
            container_tag=sanitize_tag(user_email),
            q=f"{email.subject} {email.body[:200]}",
        )
        static = "\n".join(profile.profile.static or [])
        dynamic = "\n".join(profile.profile.dynamic or [])
        memories = "\n".join(
            r.get("memory", "") for r in (profile.search_results.results or [])
        )
        memory_context = (
            f"Static profile:\n{static}\n\n"
            f"Dynamic profile:\n{dynamic}\n\n"
            f"Relevant memories:\n{memories}"
        ).strip()
    except Exception as e:
        print(f"[Supermemory] profile fetch failed: {e}")

    # 2. Analyse with Groq (memory context injected into system prompt)
    result = analyze_email(email, user_name, user_email, memory_context)

    # 3. Store the email for future context (best-effort)
    try:
        store_email_memory(email, user_email)
    except Exception as e:
        print(f"[Supermemory] store failed: {e}")

    return result


# ── Generate Reply Logic ──────────────────────────────────────────────────────

REPLY_SYSTEM_PROMPT = """You are an expert email assistant. Generate a reply to the given email.
Return ONLY a JSON object with this exact schema — no markdown, no preamble:
{
  "subject": "<reply subject starting with Re: >",
  "body": "<full reply body>"
}

Rules:
- Match the requested tone exactly: professional = polished but warm, friendly = casual and upbeat, formal = strict business language, concise = short and to the point.
- If a custom_instruction is given, follow it precisely — it overrides the default intent.
- Use the recipient's name in the sign-off.
- If memory context is provided, use it to make the reply more personalised and contextually aware.
"""


def generate_reply_for_email(req: GenerateReplyRequest) -> GenerateReplyResponse:
    """Fetch Supermemory context → generate tone-aware reply with Groq."""
    # 1. Pull relevant memories for this user + email subject
    memory_context = ""
    try:
        profile = memory_client.profile(
            container_tag=sanitize_tag(req.user_email),
            q=f"{req.subject} {req.body[:200]}",
        )
        static = "\n".join(profile.profile.static or [])
        dynamic = "\n".join(profile.profile.dynamic or [])
        memories = "\n".join(
            r.get("memory", "") for r in (profile.search_results.results or [])
        )
        memory_context = (
            f"Static profile:\n{static}\n\n"
            f"Dynamic profile:\n{dynamic}\n\n"
            f"Relevant past email memories:\n{memories}"
        ).strip()
    except Exception as e:
        print(f"[Supermemory] profile fetch failed (generate-reply): {e}")

    # 2. Build prompt
    system = REPLY_SYSTEM_PROMPT
    if memory_context:
        system += f"\n\n--- User memory context ---\n{memory_context}"

    instruction_line = (
        f"\nCustom instruction: {req.custom_instruction}" if req.custom_instruction else ""
    )
    user_prompt = (
        f"Recipient (reply sender): {req.user_name} <{req.user_email}>\n"
        f"Original sender: {req.sender_name}\n"
        f"Subject: {req.subject}\n"
        f"Tone: {req.tone}{instruction_line}\n\n"
        f"Original email body:\n{req.body}"
    )

    # 3. Call Groq
    response = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.4,
    )
    data = json.loads(response.choices[0].message.content)
    return GenerateReplyResponse(
        email_id=req.email_id,
        reply=ReplyContent(subject=data["subject"], body=data["body"]),
    )


# ── FastAPI App ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title="Email AI Processor",
    description="Analyses emails with Groq LLM and persists them in Supermemory.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/process-emails", response_model=ProcessEmailsResponse)
async def process_emails(request: ProcessEmailsRequest):
    if not request.emails:
        raise HTTPException(status_code=400, detail="emails list must not be empty")

    loop = asyncio.get_event_loop()

    # Process all emails concurrently in a thread pool
    results: list[ProcessedEmail] = await asyncio.gather(*[
        loop.run_in_executor(
            None, process_single, email, request.user_name, request.user_email
        )
        for email in request.emails
    ])

    return ProcessEmailsResponse(processed=list(results))


@app.post("/generate-reply", response_model=GenerateReplyResponse)
async def generate_reply(request: GenerateReplyRequest):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, generate_reply_for_email, request)


@app.get("/health")
async def health():
    return {"status": "ok"}
