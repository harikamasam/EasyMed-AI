from fastapi import APIRouter

from app.services.timeline_engine import build_timeline

router = APIRouter()


@router.get("")
async def get_dashboard() -> dict:
    return {
        "patient": {"name": "Aarav Sharma", "careScore": 86, "riskTrend": "stable"},
        "reports": [
            {"id": "rpt-101", "title": "Blood Panel", "date": "2026-05-08", "status": "Summarized"},
            {"id": "rpt-102", "title": "Lipid Profile", "date": "2026-04-28", "status": "Needs review"},
            {"id": "rpt-103", "title": "Thyroid Check", "date": "2026-03-17", "status": "Normal"},
        ],
        "appointments": [
            {"id": "apt-201", "doctor": "Dr. Meera Rao", "specialty": "Cardiology", "date": "2026-05-24", "time": "10:30 AM"},
            {"id": "apt-202", "doctor": "Dr. Neil Kapoor", "specialty": "General Medicine", "date": "2026-06-02", "time": "4:00 PM"},
        ],
        "reminders": [
            {"id": "rem-301", "label": "Take Vitamin D", "time": "8:00 PM"},
            {"id": "rem-302", "label": "Upload glucose reading", "time": "Tomorrow"},
        ],
        "insights": [
            "Your recent cholesterol markers are trending down.",
            "Hydration reminder triggered by elevated BUN marker.",
            "Follow-up recommended for lipid profile within 30 days.",
        ],
        "timeline": build_timeline(),
    }
