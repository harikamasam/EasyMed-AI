from typing import Any

from app.services.data_loader import load_json


def compare_report_trends(current_values: list[dict[str, Any]]) -> list[str]:
    history = load_json("patient_history.json")["reports"]
    previous = history[-1]["values"] if history else {}
    trends = []
    for value in current_values:
        name = value["name"]
        current = float(value.get("numeric_value") or str(value["value"]).replace(",", ""))
        old = previous.get(name)
        if old:
            change = ((current - old) / old) * 100
            direction = "increased" if change > 0 else "decreased"
            trends.append(f"{name} {direction} {abs(change):.0f}% compared to last report.")
    return trends


def compare_symptom_trend(risk_score: int) -> list[str]:
    checks = load_json("patient_history.json")["symptom_checks"]
    if not checks:
        return []
    previous_score = checks[-1]["risk_score"]
    direction = "increased" if risk_score > previous_score else "decreased"
    return [f"Symptom risk score {direction} {abs(risk_score - previous_score)} points compared to the last symptom check."]


def get_patient_history() -> dict[str, Any]:
    return load_json("patient_history.json")

