from datetime import date, datetime, timedelta
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    CheckupReminderCreate,
    CheckupReminderResponse,
    MedicineReminderCreate,
    MedicineReminderResponse,
    ReminderCollectionResponse,
    ReminderLogResponse,
    ReminderUpdate,
)

router = APIRouter()

medicine_reminders: dict[str, MedicineReminderResponse] = {}
checkup_reminders: dict[str, CheckupReminderResponse] = {}
reminder_logs: list[ReminderLogResponse] = []


def seed_reminders() -> None:
    if medicine_reminders or checkup_reminders:
        return

    today = date.today()
    medicine = MedicineReminderResponse(
        id="med-demo-101",
        medicine_name="Metformin",
        dosage="500 mg",
        reminder_time="08:00 AM",
        frequency="daily",
        start_date=today,
        end_date=today + timedelta(days=30),
        reminder_note="Take after breakfast.",
        status="active",
    )
    missed = MedicineReminderResponse(
        id="med-demo-102",
        medicine_name="Vitamin D",
        dosage="1000 IU",
        reminder_time="09:00 PM",
        frequency="daily",
        start_date=today - timedelta(days=10),
        end_date=today + timedelta(days=20),
        reminder_note="Missed yesterday in this demo.",
        status="missed",
    )
    checkup = CheckupReminderResponse(
        id="chk-demo-201",
        checkup_type="Lipid profile follow-up",
        doctor_or_specialist="Cardiologist",
        checkup_date=today + timedelta(days=4),
        checkup_time="10:30 AM",
        notes="Carry latest cholesterol report.",
        priority="important",
        status="active",
    )
    medicine_reminders[medicine.id] = medicine
    medicine_reminders[missed.id] = missed
    checkup_reminders[checkup.id] = checkup


def add_log(reminder_id: str, action: str, message: str) -> None:
    reminder_logs.insert(
        0,
        ReminderLogResponse(
            id=str(uuid4()),
            reminder_id=reminder_id,
            action=action,
            message=message,
            created_at=datetime.utcnow(),
        ),
    )


@router.get("", response_model=ReminderCollectionResponse)
async def get_reminders() -> ReminderCollectionResponse:
    seed_reminders()
    return ReminderCollectionResponse(
        medicine_reminders=list(medicine_reminders.values()),
        checkup_reminders=list(checkup_reminders.values()),
        reminder_logs=reminder_logs[:25],
    )


@router.post("/medicine", response_model=MedicineReminderResponse)
async def create_medicine_reminder(payload: MedicineReminderCreate) -> MedicineReminderResponse:
    reminder = MedicineReminderResponse(id=str(uuid4()), **payload.model_dump(), status="active")
    medicine_reminders[reminder.id] = reminder
    add_log(reminder.id, "created", f"Medicine reminder created for {reminder.medicine_name}.")
    return reminder


@router.post("/checkup", response_model=CheckupReminderResponse)
async def create_checkup_reminder(payload: CheckupReminderCreate) -> CheckupReminderResponse:
    reminder = CheckupReminderResponse(id=str(uuid4()), **payload.model_dump(), status="active")
    checkup_reminders[reminder.id] = reminder
    add_log(reminder.id, "created", f"Checkup reminder created for {reminder.checkup_type}.")
    return reminder


@router.patch("/{reminder_id}")
async def update_reminder(reminder_id: str, payload: ReminderUpdate) -> dict[str, str]:
    reminder = medicine_reminders.get(reminder_id) or checkup_reminders.get(reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    updates = payload.model_dump(exclude_none=True)
    updated = reminder.model_copy(update=updates)
    if reminder_id in medicine_reminders:
        medicine_reminders[reminder_id] = updated
    else:
        checkup_reminders[reminder_id] = updated
    add_log(reminder_id, "updated", "Reminder updated.")
    return {"status": "updated", "id": reminder_id}


@router.delete("/{reminder_id}")
async def delete_reminder(reminder_id: str) -> dict[str, str]:
    if reminder_id in medicine_reminders:
        del medicine_reminders[reminder_id]
    elif reminder_id in checkup_reminders:
        del checkup_reminders[reminder_id]
    else:
        raise HTTPException(status_code=404, detail="Reminder not found")

    add_log(reminder_id, "deleted", "Reminder deleted.")
    return {"status": "deleted", "id": reminder_id}


@router.post("/{reminder_id}/taken")
async def mark_medicine_as_taken(reminder_id: str) -> dict[str, str]:
    reminder = medicine_reminders.get(reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Medicine reminder not found")

    medicine_reminders[reminder_id] = reminder.model_copy(update={"status": "completed", "last_taken_at": datetime.utcnow()})
    add_log(reminder_id, "taken", f"{reminder.medicine_name} marked as taken.")
    return {"status": "completed", "id": reminder_id}


@router.post("/{reminder_id}/snooze")
async def snooze_reminder(reminder_id: str) -> dict[str, str]:
    reminder = medicine_reminders.get(reminder_id) or checkup_reminders.get(reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    snoozed_until = datetime.utcnow() + timedelta(minutes=30)
    updated = reminder.model_copy(update={"status": "snoozed", "snoozed_until": snoozed_until})
    if reminder_id in medicine_reminders:
        medicine_reminders[reminder_id] = updated
    else:
        checkup_reminders[reminder_id] = updated
    add_log(reminder_id, "snoozed", "Reminder snoozed for 30 minutes.")
    return {"status": "snoozed", "id": reminder_id}
