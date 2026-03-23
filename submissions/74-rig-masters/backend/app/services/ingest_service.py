import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.email import Email
from app.services import gemini_service


def _parse_datetime(value) -> datetime:
    """Parse ISO datetime string to datetime object. Handles Z suffix."""
    if isinstance(value, datetime):
        return value
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


async def ingest_emails_from_file(file_path: str, db: AsyncSession) -> dict:
    with open(file_path, "r") as f:
        emails_data = json.load(f)
    if not isinstance(emails_data, list):
        raise ValueError("JSON file must contain a top-level array of email objects")
    return await ingest_emails_from_json(emails_data, db)


async def ingest_emails_from_json(emails_data: list, db: AsyncSession) -> dict:
    ingested = 0
    skipped = 0

    for item in emails_data:
        # Skip duplicates
        existing = await db.execute(
            select(Email).where(Email.message_id == item["message_id"])
        )
        if existing.scalar_one_or_none():
            skipped += 1
            continue

        # Single combined Gemini call: label + suggested actions
        try:
            analysis = await gemini_service.analyze_email(
                subject=item["subject"],
                body=item["body"]
            )
            priority_label = analysis.get("label", "fyi")
            priority_reasoning = analysis.get("reasoning", "")
            suggested_actions = analysis.get("suggested_actions", [])
        except Exception as e:
            print(f"[ANALYSIS ERROR] {item['message_id']}: {e}")
            priority_label = "fyi"
            priority_reasoning = f"Auto-analysis failed: {str(e)}"
            suggested_actions = []

        email = Email(
            message_id=item["message_id"],
            sender=item["sender"],
            sender_name=item.get("sender_name"),          # new field
            recipient=item.get("recipient"),
            subject=item["subject"],
            body=item["body"],
            received_at=_parse_datetime(item["received_at"]),
            priority_label=priority_label,
            priority_reasoning=priority_reasoning,
            suggested_actions=suggested_actions,           # new field
            raw_json=item,
        )
        db.add(email)
        ingested += 1

    await db.commit()
    return {"ingested": ingested, "skipped": skipped}