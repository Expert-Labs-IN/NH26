from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.action import DraftedAction
from app.models.event import Event
from app.models.task import Task


async def execute_action(action: DraftedAction, db: AsyncSession) -> dict:
    """
    Executes an approved drafted action.
    - reply          → simulate send (log payload)
    - calendar_event → create Event record
    - task_extraction → bulk create Task records
    Returns execution_payload stored on the action.
    """
    # Use edited content if the user modified it, otherwise use AI content
    final_content = action.edited_content if action.edited_content else action.content

    if action.action_type == "reply":
        payload = {
            "type": "simulated_send",
            "to": None,  # populated from email sender by router
            "subject": final_content.get("subject", ""),
            "body": final_content.get("body", ""),
            "simulated_at": datetime.utcnow().isoformat(),
            "status": "simulated_sent",
        }
        return payload

    elif action.action_type == "calendar_event":
        start = final_content.get("start_datetime")
        end = final_content.get("end_datetime")

        event = Event(
            email_id=action.email_id,
            title=final_content.get("title", "Untitled Event"),
            description=final_content.get("description"),
            location=final_content.get("location"),
            start_datetime=datetime.fromisoformat(start) if start else None,
            end_datetime=datetime.fromisoformat(end) if end else None,
            status="pending",
        )
        db.add(event)
        await db.flush()

        payload = {
            "type": "calendar_event_created",
            "event_id": str(event.id),
            "title": event.title,
            "start_datetime": start,
            "end_datetime": end,
        }
        return payload

    elif action.action_type == "task_extraction":
        tasks_data = final_content if isinstance(final_content, list) else []
        created_ids = []

        for t in tasks_data:
            due_raw = t.get("due_date")
            due = date.fromisoformat(due_raw) if due_raw else None

            task = Task(
                email_id=action.email_id,
                title=t.get("title", "Untitled Task"),
                description=t.get("description"),
                due_date=due,
                priority=t.get("priority", "normal"),
                status="todo",
            )
            db.add(task)
            await db.flush()
            created_ids.append(str(task.id))

        payload = {
            "type": "tasks_created",
            "count": len(created_ids),
            "task_ids": created_ids,
        }
        return payload

    else:
        raise ValueError(f"Unknown action_type: {action.action_type}")
