from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.database import get_db
from app.models.email import Email
from app.models.action import DraftedAction
from app.schemas.action import DraftRequest, DraftedActionResponse
from app.services import gemini_service

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/summarize/{email_id}")
async def summarize_email(email_id: UUID, db: AsyncSession = Depends(get_db)):
    """Force-regenerate the 3-bullet summary and update the cache."""
    result = await db.execute(select(Email).where(Email.id == email_id))
    email = result.scalar_one_or_none()
    if not email:
        raise HTTPException(404, "Email not found")

    bullets = await gemini_service.summarize_email(email.subject, email.body)
    email.summary_bullets = bullets
    await db.commit()

    return {"email_id": str(email_id), "summary_bullets": bullets}


@router.post("/draft/{email_id}", response_model=DraftedActionResponse)
async def draft_action(
    email_id: UUID,
    body: DraftRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Ask Gemini to draft an action for an email.
    action_type: reply | calendar_event | task_extraction
    """
    result = await db.execute(select(Email).where(Email.id == email_id))
    email = result.scalar_one_or_none()
    if not email:
        raise HTTPException(404, "Email not found")

    valid_types = {"reply", "calendar_event", "task_extraction"}
    if body.action_type not in valid_types:
        raise HTTPException(400, f"action_type must be one of: {valid_types}")

    if body.action_type == "reply":
        content = await gemini_service.draft_reply(email.subject, email.body)
    elif body.action_type == "calendar_event":
        content = await gemini_service.extract_calendar_event(email.subject, email.body)
    elif body.action_type == "task_extraction":
        content = await gemini_service.extract_tasks(email.subject, email.body)

    action = DraftedAction(
        email_id=email_id,
        action_type=body.action_type,
        content=content,
        status="pending",
    )
    db.add(action)
    await db.commit()
    await db.refresh(action)
    return action


@router.post("/analyze/{email_id}")
async def reanalyze_email(email_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Re-run the full AI analysis on an email:
    updates priority_label, priority_reasoning, and suggested_actions.
    """
    result = await db.execute(select(Email).where(Email.id == email_id))
    email = result.scalar_one_or_none()
    if not email:
        raise HTTPException(404, "Email not found")

    analysis = await gemini_service.analyze_email(email.subject, email.body)
    email.priority_label = analysis.get("label", "fyi")
    email.priority_reasoning = analysis.get("reasoning", "")
    email.suggested_actions = analysis.get("suggested_actions", [])
    await db.commit()

    return {
        "email_id": str(email_id),
        "priority_label": email.priority_label,
        "priority_reasoning": email.priority_reasoning,
        "suggested_actions": email.suggested_actions,
    }