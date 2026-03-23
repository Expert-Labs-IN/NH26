from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models.event import Event
from app.schemas.event_task import EventResponse, EventUpdate, EventStatusUpdate

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.get("/", response_model=List[EventResponse])
async def list_events(
    status: Optional[str] = Query(None, description="Filter by: pending, confirmed, cancelled"),
    db: AsyncSession = Depends(get_db)
):
    """List all calendar events, optionally filtered by status."""
    query = select(Event).order_by(Event.start_datetime.asc().nullslast())
    if status:
        query = query.where(Event.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(404, "Event not found")
    return event


@router.patch("/{event_id}", response_model=EventResponse)
async def update_event(event_id: UUID, body: EventUpdate, db: AsyncSession = Depends(get_db)):
    """Update event details (title, time, location, description)."""
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(404, "Event not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    await db.commit()
    await db.refresh(event)
    return event


@router.patch("/{event_id}/status", response_model=EventResponse)
async def update_event_status(event_id: UUID, body: EventStatusUpdate, db: AsyncSession = Depends(get_db)):
    """Update event status: pending → confirmed → cancelled"""
    valid = {"pending", "confirmed", "cancelled"}
    if body.status not in valid:
        raise HTTPException(400, f"Status must be one of: {valid}")

    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(404, "Event not found")

    event.status = body.status
    await db.commit()
    await db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(404, "Event not found")
    await db.delete(event)
    await db.commit()
