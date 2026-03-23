from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.action import DraftedAction
from app.models.email import Email
from app.schemas.action import DraftedActionResponse, EditActionRequest, RegenerateRequest
from app.services import gemini_service, action_service

router = APIRouter(prefix="/api/actions", tags=["Actions"])


@router.get("/{email_id}", response_model=List[DraftedActionResponse])
async def get_actions_for_email(email_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get all drafted actions for a specific email."""
    result = await db.execute(
        select(DraftedAction)
        .where(DraftedAction.email_id == email_id)
        .order_by(DraftedAction.created_at.desc())
    )
    return result.scalars().all()


@router.patch("/{action_id}", response_model=DraftedActionResponse)
async def edit_action(
    action_id: UUID,
    body: EditActionRequest,
    db: AsyncSession = Depends(get_db)
):
    """Manually edit the content of a drafted action."""
    result = await db.execute(select(DraftedAction).where(DraftedAction.id == action_id))
    action = result.scalar_one_or_none()
    if not action:
        raise HTTPException(404, "Action not found")
    if action.status not in ("pending",):
        raise HTTPException(400, f"Cannot edit an action with status '{action.status}'")

    action.edited_content = body.edited_content
    await db.commit()
    await db.refresh(action)
    return action


@router.post("/{action_id}/regenerate", response_model=DraftedActionResponse)
async def regenerate_action(
    action_id: UUID,
    body: RegenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Regenerate a drafted action using a custom prompt instruction."""
    result = await db.execute(
        select(DraftedAction)
        .where(DraftedAction.id == action_id)
        .options(selectinload(DraftedAction.email))
    )
    action = result.scalar_one_or_none()
    if not action:
        raise HTTPException(404, "Action not found")
    if action.status not in ("pending",):
        raise HTTPException(400, f"Cannot regenerate an action with status '{action.status}'")

    email = action.email

    if action.action_type == "reply":
        new_content = await gemini_service.draft_reply(email.subject, email.body, body.prompt)
    elif action.action_type == "calendar_event":
        new_content = await gemini_service.extract_calendar_event(email.subject, email.body, body.prompt)
    elif action.action_type == "task_extraction":
        new_content = await gemini_service.extract_tasks(email.subject, email.body, body.prompt)
    else:
        raise HTTPException(400, f"Unknown action type: {action.action_type}")

    action.content = new_content
    action.edited_content = None  # Clear any previous manual edits
    action.regeneration_prompt = body.prompt
    await db.commit()
    await db.refresh(action)
    return action


@router.post("/{action_id}/approve", response_model=DraftedActionResponse)
async def approve_action(action_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Approve & execute a drafted action.
    - reply          → simulate send, log payload
    - calendar_event → create Event record
    - task_extraction → bulk create Task records
    """
    result = await db.execute(
        select(DraftedAction)
        .where(DraftedAction.id == action_id)
        .options(selectinload(DraftedAction.email))
    )
    action = result.scalar_one_or_none()
    if not action:
        raise HTTPException(404, "Action not found")
    if action.status != "pending":
        raise HTTPException(400, f"Action is already '{action.status}'")

    payload = await action_service.execute_action(action, db)

    # For reply simulations, attach the recipient from the email
    if action.action_type == "reply" and action.email:
        payload["to"] = action.email.sender

    action.status = "executed"
    action.executed_at = datetime.utcnow()
    action.execution_payload = payload

    await db.commit()
    await db.refresh(action)
    return action


@router.post("/{action_id}/reject", response_model=DraftedActionResponse)
async def reject_action(action_id: UUID, db: AsyncSession = Depends(get_db)):
    """Reject a drafted action."""
    result = await db.execute(select(DraftedAction).where(DraftedAction.id == action_id))
    action = result.scalar_one_or_none()
    if not action:
        raise HTTPException(404, "Action not found")
    if action.status != "pending":
        raise HTTPException(400, f"Action is already '{action.status}'")

    action.status = "rejected"
    await db.commit()
    await db.refresh(action)
    return action
