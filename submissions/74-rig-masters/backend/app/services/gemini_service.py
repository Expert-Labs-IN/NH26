# import json
# import re
# import httpx
# from datetime import date
# from app.core.config import settings

# GEMINI_URL = (
#     f"https://generativelanguage.googleapis.com/v1beta/models/"
#     f"{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
# )

# TODAY = date.today().isoformat()


# # ─────────────────────────────────────────────────────────────────────────────
# # 🔹 GEMINI SCHEMAS
# # These tell Gemini exactly what shape to produce — it cannot deviate.
# # Using response_schema + response_mime_type="application/json" forces
# # Gemini into a constrained JSON mode that prevents truncation entirely.
# # ─────────────────────────────────────────────────────────────────────────────

# SCHEMA_ANALYZE = {
#     "type": "OBJECT",
#     "properties": {
#         "label": {
#             "type": "STRING",
#             "enum": ["urgent", "requires_action", "fyi"]
#         },
#         "reasoning": {"type": "STRING"},
#         "suggested_actions": {
#             "type": "ARRAY",
#             "items": {
#                 "type": "STRING",
#                 "enum": ["reply", "calendar_event", "task_extraction"]
#             }
#         }
#     },
#     "required": ["label", "reasoning", "suggested_actions"]
# }

# SCHEMA_SUMMARIZE = {
#     "type": "ARRAY",
#     "items": {"type": "STRING"},
#     "minItems": 3,
#     "maxItems": 3
# }

# SCHEMA_DRAFT_REPLY = {
#     "type": "OBJECT",
#     "properties": {
#         "subject": {"type": "STRING"},
#         "body":    {"type": "STRING"}
#     },
#     "required": ["subject", "body"]
# }

# SCHEMA_CALENDAR = {
#     "type": "OBJECT",
#     "properties": {
#         "title":          {"type": "STRING"},
#         "description":    {"type": "STRING"},
#         "start_datetime": {"type": "STRING"},
#         "end_datetime":   {"type": "STRING"},
#         "location":       {"type": "STRING"}
#     },
#     "required": ["title", "description", "start_datetime", "end_datetime", "location"]
# }

# SCHEMA_TASKS = {
#     "type": "ARRAY",
#     "items": {
#         "type": "OBJECT",
#         "properties": {
#             "title":       {"type": "STRING"},
#             "description": {"type": "STRING"},
#             "due_date":    {"type": "STRING"},
#             "priority":    {
#                 "type": "STRING",
#                 "enum": ["low", "normal", "high"]
#             }
#         },
#         "required": ["title", "description", "due_date", "priority"]
#     }
# }


# # ─────────────────────────────────────────────────────────────────────────────
# # 🔹 HELPERS
# # ─────────────────────────────────────────────────────────────────────────────

# def _clean_body(body: str, max_chars: int = 1500) -> str:
#     """Collapse whitespace and truncate body to reduce prompt token waste."""
#     return " ".join(body[:max_chars].split())


# # ─────────────────────────────────────────────────────────────────────────────
# # 🔹 CORE GEMINI CALL
# # ─────────────────────────────────────────────────────────────────────────────

# async def _call_gemini(
#     prompt: str,
#     schema: dict,
#     max_tokens: int = 512,
#     retries: int = 3
# ) -> dict | list:
#     """
#     Call Gemini with a strict response_schema and response_mime_type=application/json.

#     This forces Gemini to produce only valid, complete JSON matching the schema.
#     No truncation issues, no markdown fences, no stray text.

#     Retries with an escalating token budget in case of transient failures.
#     """
#     async with httpx.AsyncClient(timeout=60) as client:  # 60s — never cut off mid-response
#         for attempt in range(retries):
#             attempt_tokens = max_tokens + (attempt * 128)

#             payload = {
#                 "contents": [{"parts": [{"text": prompt}]}],
#                 "generationConfig": {
#                     "temperature": 0.2,
#                     "maxOutputTokens": attempt_tokens,
#                     # ✅ KEY FIX: Forces Gemini into constrained JSON output mode
#                     "response_mime_type": "application/json",
#                     "response_schema": schema,
#                 },
#             }

#             try:
#                 response = await client.post(GEMINI_URL, json=payload)
#                 response.raise_for_status()
#                 data = response.json()

#                 raw = data["candidates"][0]["content"]["parts"][0]["text"].strip()
#                 print(f"\n🔵 GEMINI RESPONSE (attempt {attempt + 1}, tokens={attempt_tokens}):\n{raw}")

#                 parsed = json.loads(raw)
#                 return parsed

#             except json.JSONDecodeError as e:
#                 print(f"⚠️  JSON parse error (attempt {attempt + 1}): {e}\nRaw: {raw!r}")
#             except KeyError as e:
#                 print(f"⚠️  Unexpected Gemini response shape (attempt {attempt + 1}): {e}")
#                 print(f"    Full response: {data}")
#             except Exception as e:
#                 print(f"⚠️  Gemini call failed (attempt {attempt + 1}): {e}")

#     raise ValueError("Gemini failed to return valid JSON after all retries")


# # ─────────────────────────────────────────────────────────────────────────────
# # 🔹 ANALYZE EMAIL
# # ─────────────────────────────────────────────────────────────────────────────

# async def analyze_email(subject: str, body: str) -> dict:
#     prompt = f"""
# You are an AI email triage assistant. Today is {TODAY}.

# Classify the email and suggest actions. Keep reasoning under 10 words.
# Only use these actions: reply, calendar_event, task_extraction.

# Subject: {subject}
# Body: {_clean_body(body)}
# """
#     try:
#         return await _call_gemini(prompt, schema=SCHEMA_ANALYZE, max_tokens=256)
#     except Exception as e:
#         print(f"❌ FINAL FAILURE (analyze_email): {e}")
#         return {
#             "label": "requires_action",
#             "reasoning": "Fallback due to parsing failure",
#             "suggested_actions": []
#         }


# # ─────────────────────────────────────────────────────────────────────────────
# # 🔹 SUMMARIZE EMAIL
# # ─────────────────────────────────────────────────────────────────────────────

# async def summarize_email(subject: str, body: str) -> list[str]:
#     prompt = f"""
# You are an email summarization assistant.

# Return exactly 3 short bullet points summarizing the email.
# Each point must be under 15 words.

# Subject: {subject}
# Body: {_clean_body(body, max_chars=2000)}
# """
#     try:
#         result = await _call_gemini(prompt, schema=SCHEMA_SUMMARIZE, max_tokens=256)
#         if isinstance(result, list) and len(result) == 3:
#             return result
#         raise ValueError(f"Expected 3-item list, got: {result}")
#     except Exception as e:
#         print(f"❌ FINAL FAILURE (summarize_email): {e}")
#         return ["Summary unavailable", "Parsing failed", "Check original email"]


# # ─────────────────────────────────────────────────────────────────────────────
# # 🔹 DRAFT REPLY
# # ─────────────────────────────────────────────────────────────────────────────

# async def draft_reply(subject: str, body: str, custom_prompt: str = None) -> dict:
#     extra = f"\nAdditional instruction: {custom_prompt}" if custom_prompt else ""

#     prompt = f"""
# You are a professional email assistant.

# Write a concise, professional reply (3-5 sentences). No line breaks inside the body.
# {extra}

# Original Subject: {subject}
# Original Body: {_clean_body(body, max_chars=2000)}
# """
#     try:
#         result = await _call_gemini(prompt, schema=SCHEMA_DRAFT_REPLY, max_tokens=512)
#         if not result.get("subject"):
#             result["subject"] = f"Re: {subject}"
#         return result
#     except Exception as e:
#         print(f"❌ FINAL FAILURE (draft_reply): {e}")
#         return {
#             "subject": f"Re: {subject}",
#             "body": "Sorry, I couldn't generate a reply at this time."
#         }


# # ─────────────────────────────────────────────────────────────────────────────
# # 🔹 CALENDAR EVENT EXTRACTION
# # ─────────────────────────────────────────────────────────────────────────────

# async def extract_calendar_event(subject: str, body: str, custom_prompt: str = None) -> dict:
#     extra = f"\nAdditional instruction: {custom_prompt}" if custom_prompt else ""

#     prompt = f"""
# You are a calendar assistant. Today is {TODAY}.

# Extract event details from the email. Use ISO 8601 format for datetimes (e.g. 2025-04-01T14:00:00).
# Use empty string "" for missing fields — do NOT use null.
# Keep description under 15 words.
# {extra}

# Subject: {subject}
# Body: {_clean_body(body, max_chars=2000)}
# """
#     try:
#         result = await _call_gemini(prompt, schema=SCHEMA_CALENDAR, max_tokens=256)
#         # Normalize empty strings to None for API consumers
#         return {k: v if v else None for k, v in result.items()}
#     except Exception as e:
#         print(f"❌ FINAL FAILURE (extract_calendar_event): {e}")
#         return {
#             "title": None,
#             "description": None,
#             "start_datetime": None,
#             "end_datetime": None,
#             "location": None
#         }


# # ─────────────────────────────────────────────────────────────────────────────
# # 🔹 TASK EXTRACTION
# # ─────────────────────────────────────────────────────────────────────────────

# async def extract_tasks(subject: str, body: str, custom_prompt: str = None) -> list[dict]:
#     extra = f"\nAdditional instruction: {custom_prompt}" if custom_prompt else ""

#     prompt = f"""
# You are a task extraction assistant. Today is {TODAY}.

# Extract all actionable tasks from the email.
# - title: under 10 words
# - description: under 15 words, or empty string if none
# - due_date: ISO 8601 date (e.g. 2025-04-01), or empty string if unknown
# - priority: "low", "normal", or "high"

# Return an empty array [] if there are no tasks.
# {extra}

# Subject: {subject}
# Body: {_clean_body(body, max_chars=2000)}
# """
#     try:
#         result = await _call_gemini(prompt, schema=SCHEMA_TASKS, max_tokens=512)
#         if isinstance(result, list):
#             # Normalize empty strings to None for API consumers
#             return [
#                 {k: v if v else None for k, v in task.items()}
#                 for task in result
#             ]
#         raise ValueError(f"Expected list, got: {type(result)}")
#     except Exception as e:
#         print(f"❌ FINAL FAILURE (extract_tasks): {e}")
#         return []
import json
import httpx
from datetime import date
from app.core.config import settings

GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
)

TODAY = date.today().isoformat()


# ─────────────────────────────────────────────────────────────────────────────
# 🔹 RESPONSE SCHEMAS
# Passed to Gemini's response_schema for constrained JSON generation.
# NOTE: nullable fields use {"anyOf": [{"type": "..."}, {"type": "null"}]}
# ─────────────────────────────────────────────────────────────────────────────

SCHEMA_ANALYZE = {
    "type": "OBJECT",
    "properties": {
        "label": {
            "type": "STRING",
            "enum": ["urgent", "requires_action", "fyi"]
        },
        "reasoning": {"type": "STRING"},
        "suggested_actions": {
            "type": "ARRAY",
            "items": {
                "type": "STRING",
                "enum": ["reply", "calendar_event", "task_extraction"]
            }
        }
    },
    "required": ["label", "reasoning", "suggested_actions"]
}

SCHEMA_SUMMARIZE = {
    "type": "ARRAY",
    "items": {"type": "STRING"},
}

SCHEMA_DRAFT_REPLY = {
    "type": "OBJECT",
    "properties": {
        "subject": {"type": "STRING"},
        "body":    {"type": "STRING"}
    },
    "required": ["subject", "body"]
}

SCHEMA_CALENDAR = {
    "type": "OBJECT",
    "properties": {
        "title":          {"type": "STRING"},
        "description":    {"type": "STRING"},
        "start_datetime": {"type": "STRING"},
        "end_datetime":   {"type": "STRING"},
        "location":       {"type": "STRING"}
    },
    "required": ["title", "description", "start_datetime", "end_datetime", "location"]
}

SCHEMA_TASKS = {
    "type": "ARRAY",
    "items": {
        "type": "OBJECT",
        "properties": {
            "title":       {"type": "STRING"},
            "description": {"type": "STRING"},
            "due_date":    {"type": "STRING"},
            "priority":    {
                "type": "STRING",
                "enum": ["low", "normal", "high"]
            }
        },
        "required": ["title", "description", "due_date", "priority"]
    }
}


# ─────────────────────────────────────────────────────────────────────────────
# 🔹 TOKEN BUDGET CONSTANTS
#
# Gemini 2.5 Flash is a THINKING model. It consumes tokens internally
# before writing any output. The finishReason=MAX_TOKENS errors in logs
# happened because thinking tokens ate the entire budget.
#
# Budget formula: thinking_tokens + output_tokens <= maxOutputTokens
# Thinking tokens: ~200–500 for simple prompts (we budget 512 as floor)
# Output tokens:   varies by function
#
# We set a high floor and never go below it.
# ─────────────────────────────────────────────────────────────────────────────

THINKING_OVERHEAD = 512   # Reserved for Gemini 2.5 Flash internal reasoning
BASE_TOKENS = {
    "analyze":   256,   # Small fixed output: label + short reasoning + array
    "summarize": 256,   # 3 short strings
    "reply":     512,   # Paragraph of text
    "calendar":  256,   # ~5 fields
    "tasks":     512,   # Variable-length list
}


# ─────────────────────────────────────────────────────────────────────────────
# 🔹 HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _clean_body(body: str, max_chars: int = 1500) -> str:
    """Collapse whitespace and truncate body to reduce prompt token waste."""
    return " ".join(body[:max_chars].split())


def _budget(task: str, retry: int = 0) -> int:
    """
    Compute maxOutputTokens for a task + retry attempt.
    Thinking overhead + output budget + retry escalation.
    """
    return THINKING_OVERHEAD + BASE_TOKENS[task] + (retry * 256)


# ─────────────────────────────────────────────────────────────────────────────
# 🔹 CORE GEMINI CALL
# ─────────────────────────────────────────────────────────────────────────────

async def _call_gemini(
    prompt: str,
    schema: dict,
    task: str,
    retries: int = 3,
) -> dict | list:
    """
    Call Gemini with:
    - response_mime_type="application/json"  → forces JSON-only output
    - response_schema                        → constrains the exact shape
    - thinking overhead in maxOutputTokens   → prevents MAX_TOKENS mid-output
    - escalating budget per retry            → recovers from edge-case overruns

    The thinking model (Gemini 2.5 Flash) uses tokens internally before
    writing output. We account for this by adding THINKING_OVERHEAD to every
    budget calculation.
    """
    async with httpx.AsyncClient(timeout=60) as client:
        for attempt in range(retries):
            max_tokens = _budget(task, attempt)

            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": max_tokens,
                    "response_mime_type": "application/json",
                    "response_schema": schema,
                },
            }

            try:
                response = await client.post(GEMINI_URL, json=payload)
                response.raise_for_status()
                data = response.json()

                # Detect MAX_TOKENS finish reason — thinking ate the budget
                candidate = data["candidates"][0]
                finish_reason = candidate.get("finishReason", "")
                if finish_reason == "MAX_TOKENS":
                    thoughts = data.get("usageMetadata", {}).get("thoughtsTokenCount", "?")
                    print(f"⚠️  MAX_TOKENS on attempt {attempt + 1} "
                          f"(budget={max_tokens}, thoughtsTokens={thoughts}). "
                          f"Retrying with larger budget...")
                    continue

                raw = candidate["content"]["parts"][0]["text"].strip()
                print(f"\n🔵 GEMINI RESPONSE (attempt {attempt + 1}, budget={max_tokens}):\n{raw}")

                parsed = json.loads(raw)
                return parsed

            except json.JSONDecodeError as e:
                print(f"⚠️  JSON parse error (attempt {attempt + 1}): {e}\nRaw: {raw!r}")
            except KeyError as e:
                print(f"⚠️  Unexpected response shape (attempt {attempt + 1}): {e}")
                print(f"    Full response: {data}")
            except Exception as e:
                print(f"⚠️  Gemini call failed (attempt {attempt + 1}): {e}")

    raise ValueError(f"Gemini [{task}] failed after {retries} retries")


# ─────────────────────────────────────────────────────────────────────────────
# 🔹 ANALYZE EMAIL
# ─────────────────────────────────────────────────────────────────────────────

async def analyze_email(subject: str, body: str) -> dict:
    prompt = f"""
You are an AI email triage assistant. Today is {TODAY}.

Classify the email as urgent, requires_action, or fyi.
Suggest relevant actions from: reply, calendar_event, task_extraction.
Keep reasoning under 10 words.

Subject: {subject}
Body: {_clean_body(body)}
"""
    try:
        return await _call_gemini(prompt, schema=SCHEMA_ANALYZE, task="analyze")
    except Exception as e:
        print(f"❌ FINAL FAILURE (analyze_email): {e}")
        return {
            "label": "requires_action",
            "reasoning": "Fallback due to API failure",
            "suggested_actions": []
        }


# ─────────────────────────────────────────────────────────────────────────────
# 🔹 SUMMARIZE EMAIL
# ─────────────────────────────────────────────────────────────────────────────

async def summarize_email(subject: str, body: str) -> list[str]:
    prompt = f"""
You are an email summarization assistant.

Summarize the email in exactly 3 bullet points.
Each point must be a single short sentence under 15 words.

Subject: {subject}
Body: {_clean_body(body, max_chars=2000)}
"""
    try:
        result = await _call_gemini(prompt, schema=SCHEMA_SUMMARIZE, task="summarize")
        if isinstance(result, list) and len(result) >= 3:
            return result[:3]
        raise ValueError(f"Expected list of 3, got: {result}")
    except Exception as e:
        print(f"❌ FINAL FAILURE (summarize_email): {e}")
        return ["Summary unavailable", "Parsing failed", "Check original email"]


# ─────────────────────────────────────────────────────────────────────────────
# 🔹 DRAFT REPLY
# ─────────────────────────────────────────────────────────────────────────────

async def draft_reply(subject: str, body: str, custom_prompt: str = None) -> dict:
    extra = f"\nAdditional instruction: {custom_prompt}" if custom_prompt else ""

    prompt = f"""
You are a professional email assistant.

Write a concise, professional reply in 3–5 sentences.
Do not include line breaks inside the body field.
{extra}

Original Subject: {subject}
Original Body: {_clean_body(body, max_chars=2000)}
"""
    try:
        result = await _call_gemini(prompt, schema=SCHEMA_DRAFT_REPLY, task="reply")
        if not result.get("subject"):
            result["subject"] = f"Re: {subject}"
        return result
    except Exception as e:
        print(f"❌ FINAL FAILURE (draft_reply): {e}")
        return {
            "subject": f"Re: {subject}",
            "body": "Sorry, I couldn't generate a reply at this time."
        }


# ─────────────────────────────────────────────────────────────────────────────
# 🔹 CALENDAR EVENT EXTRACTION
# ─────────────────────────────────────────────────────────────────────────────

async def extract_calendar_event(subject: str, body: str, custom_prompt: str = None) -> dict:
    extra = f"\nAdditional instruction: {custom_prompt}" if custom_prompt else ""

    prompt = f"""
You are a calendar assistant. Today is {TODAY}.

Extract event details from the email.
Use ISO 8601 format for datetimes (e.g. 2025-04-01T14:00:00).
Use empty string for any field that cannot be determined.
Keep description under 15 words.
{extra}

Subject: {subject}
Body: {_clean_body(body, max_chars=2000)}
"""
    try:
        result = await _call_gemini(prompt, schema=SCHEMA_CALENDAR, task="calendar")
        return {k: v if v else None for k, v in result.items()}
    except Exception as e:
        print(f"❌ FINAL FAILURE (extract_calendar_event): {e}")
        return {
            "title": None, "description": None,
            "start_datetime": None, "end_datetime": None, "location": None
        }


# ─────────────────────────────────────────────────────────────────────────────
# 🔹 TASK EXTRACTION
# ─────────────────────────────────────────────────────────────────────────────

async def extract_tasks(subject: str, body: str, custom_prompt: str = None) -> list[dict]:
    extra = f"\nAdditional instruction: {custom_prompt}" if custom_prompt else ""

    prompt = f"""
You are a task extraction assistant. Today is {TODAY}.

Extract all actionable tasks from the email.
- title: short phrase under 10 words
- description: under 15 words, or empty string if none
- due_date: ISO 8601 date string (e.g. 2025-04-01), or empty string if unknown
- priority: one of low, normal, high

Return an empty array if there are no tasks.
{extra}

Subject: {subject}
Body: {_clean_body(body, max_chars=2000)}
"""
    try:
        result = await _call_gemini(prompt, schema=SCHEMA_TASKS, task="tasks")
        if isinstance(result, list):
            return [{k: v if v else None for k, v in task.items()} for task in result]
        raise ValueError(f"Expected list, got: {type(result)}")
    except Exception as e:
        print(f"❌ FINAL FAILURE (extract_tasks): {e}")
        return []