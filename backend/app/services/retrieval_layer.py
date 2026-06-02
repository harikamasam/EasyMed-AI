from typing import Any

from app.services.data_loader import load_json


def retrieve_medical_knowledge(symptoms: list[str], report_values: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    symptom_set = {_normalize(item) for item in symptoms}
    value_signals = {_value_signal(item) for item in report_values or []}
    records = []

    for item in load_json("medical_knowledge.json"):
        matched_symptoms = sorted(symptom_set & {_normalize(symptom) for symptom in item["symptoms"]})
        matched_risks = sorted(value_signals & {_normalize(factor) for factor in item["risk_factors"]})
        score = (len(matched_symptoms) * 2) + len(matched_risks)
        if score:
            records.append({**item, "matched_symptoms": matched_symptoms, "matched_risk_factors": matched_risks, "retrieval_score": score})

    return sorted(records, key=lambda record: record["retrieval_score"], reverse=True)[:4]


def _value_signal(value: dict[str, Any]) -> str:
    name = _normalize(str(value.get("name", "")))
    status = _normalize(str(value.get("status", "")))
    return f"{status} {name}".strip()


def _normalize(value: str) -> str:
    return value.lower().replace("wbc count", "wbc").strip()

