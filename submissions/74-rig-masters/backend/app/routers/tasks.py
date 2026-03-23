from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models.task import Task
from app.schemas.event_task import TaskResponse, TaskUpdate, TaskStatusUpdate

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    status: Optional[str] = Query(None, description="Filter by: todo, in_progress, done"),
    priority: Optional[str] = Query(None, description="Filter by: urgent, normal, low"),
    db: AsyncSession = Depends(get_db)
):
    """List all tasks, optionally filtered by status or priority."""
    query = select(Task).order_by(Task.due_date.asc().nullslast())
    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: UUID, body: TaskUpdate, db: AsyncSession = Depends(get_db)):
    """Update task details."""
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    await db.commit()
    await db.refresh(task)
    return task


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(task_id: UUID, body: TaskStatusUpdate, db: AsyncSession = Depends(get_db)):
    """Progress a task: todo → in_progress → done"""
    valid = {"todo", "in_progress", "done"}
    if body.status not in valid:
        raise HTTPException(400, f"Status must be one of: {valid}")

    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")

    task.status = body.status
    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    await db.delete(task)
    await db.commit()
