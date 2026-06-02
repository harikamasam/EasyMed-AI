from typing import Any


def recommend_specialist(retrieved: list[dict[str, Any]], risk: dict[str, Any], report_values: list[dict[str, Any]] | None = None) -> str:
    if risk["severity_level"] == "Emergency":
        return "Emergency Physician"
    if retrieved:
        return retrieved[0]["specialist"]
    abnormal_names = {item["name"] for item in report_values or [] if item.get("status") in {"High", "Low"}}
    if "Glucose" in abnormal_names or "Vitamin D" in abnormal_names:
        return "General Physician or Endocrinologist"
    if "Cholesterol" in abnormal_names:
        return "General Physician or Cardiologist"
    return "General Physician"


def build_reasoning_card(inputs: list[str], findings: list[str], risk: dict[str, Any], specialist: str, action: str) -> dict[str, Any]:
    return {
        "inputs_considered": inputs,
        "key_findings": findings,
        "risk_factors": risk["risk_factors"],
        "confidence_score": risk["confidence_score"],
        "recommended_specialist": specialist,
        "next_recommended_action": action,
    }

