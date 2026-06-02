from datetime import datetime
from typing import Any

from app.services.case_history import get_patient_history


def build_timeline(current_event: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    history = get_patient_history()
    events = []
    for report in history["reports"]:
        events.append({"id": report["id"], "date": report["date"], "type": "Report", "title": report["report_name"], "detail": f"Risk score {report['risk_score']}"})
    for check in history["symptom_checks"]:
        events.append({"id": check["id"], "date": check["date"], "type": "Risk change", "title": check["severity_level"], "detail": f"Risk score {check['risk_score']}"})
    for appointment in history["appointments"]:
        events.append({"id": appointment["id"], "date": appointment["date"], "type": "Appointment", "title": appointment["title"], "detail": appointment["specialty"]})
    for reminder in history["reminders"]:
        events.append({"id": reminder["id"], "date": reminder["date"], "type": "Reminder", "title": reminder["title"], "detail": "Scheduled follow-up"})
    if current_event:
        events.append({"id": "current-analysis", "date": datetime.utcnow().date().isoformat(), **current_event})
    return sorted(events, key=lambda event: event["date"], reverse=True)[:8]

