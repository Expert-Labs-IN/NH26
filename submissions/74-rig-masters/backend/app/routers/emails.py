from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
import json, tempfile, os
from uuid import UUID

from app.database import get_db
from app.models.email import Email
from app.schemas.email import EmailListItem, EmailDetail, EmailMarkRead, IngestResponse
from app.services import ingest_service, gemini_service

router = APIRouter(prefix="/api/emails", tags=["Emails"])


@router.post("/ingest", response_model=IngestResponse)
async def ingest_emails(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload a JSON file of mock emails to ingest into the database."""
    if not file.filename.endswith(".json"):
        raise HTTPException(400, "Only .json files are accepted")

    contents = await file.read()
    try:
        emails_data = json.loads(contents)
    except json.JSONDecodeError:
        raise HTTPException(400, "Invalid JSON file")

    result = await ingest_service.ingest_emails_from_json(emails_data, db)
    return IngestResponse(
        ingested=result["ingested"],
        skipped=result["skipped"],
        message=f"Successfully ingested {result['ingested']} emails. {result['skipped']} skipped (duplicates)."
    )


@router.get("/", response_model=List[EmailListItem])
async def list_emails(
    priority: Optional[str] = Query(None, description="Filter by: urgent, requires_action, fyi"),
    is_read: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List all emails, optionally filtered by priority label or read status."""
    query = select(Email).order_by(desc(Email.received_at))

    if priority:
        query = query.where(Email.priority_label == priority)
    if is_read is not None:
        query = query.where(Email.is_read == is_read)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{email_id}", response_model=EmailDetail)
async def get_email(email_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Get a single email. On first open, generates and caches a 3-bullet summary.
    Subsequent opens return the cached summary instantly.
    """
    result = await db.execute(select(Email).where(Email.id == email_id))
    email = result.scalar_one_or_none()
    if not email:
        raise HTTPException(404, "Email not found")

    # Generate summary on first open (lazy cache)
    if not email.summary_bullets:
        try:
            bullets = await gemini_service.summarize_email(email.subject, email.body)
            email.summary_bullets = bullets
            await db.commit()
            await db.refresh(email)
        except Exception:
            pass  # Non-fatal, summary stays null

    return email


@router.patch("/{email_id}/read", response_model=EmailDetail)
async def mark_read(email_id: UUID, body: EmailMarkRead, db: AsyncSession = Depends(get_db)):
    """Mark an email as read or unread."""
    result = await db.execute(select(Email).where(Email.id == email_id))
    email = result.scalar_one_or_none()
    if not email:
        raise HTTPException(404, "Email not found")

    email.is_read = body.is_read
    await db.commit()
    await db.refresh(email)
    return email
