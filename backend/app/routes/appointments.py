from uuid import uuid4

from fastapi import APIRouter

from app.models.schemas import AppointmentCreate, AppointmentResponse

router = APIRouter()


@router.get("")
async def list_appointments() -> list[dict[str, str]]:
    return [
        {
            "id": "apt-201",
            "patient_name": "Aarav Sharma",
            "doctor": "Dr. Meera Rao",
            "specialty": "Cardiology",
            "appointment_date": "2026-05-24",
            "appointment_time": "10:30 AM",
            "reason": "Lipid profile follow-up",
            "status": "confirmed",
        }
    ]


@router.post("", response_model=AppointmentResponse)
async def create_appointment(payload: AppointmentCreate) -> AppointmentResponse:
    return AppointmentResponse(id=str(uuid4()), **payload.model_dump(), status="confirmed")
