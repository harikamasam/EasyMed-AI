from datetime import datetime
from typing import Any

from app.services.case_history import compare_report_trends, compare_symptom_trend
from app.services.recommendation_service import build_reasoning_card, recommend_specialist
from app.services.report_parser import parse_report_text
from app.services.retrieval_layer import retrieve_medical_knowledge
from app.services.risk_engine import evaluate_risk
from app.services.similarity_search import find_similar_cases
from app.services.timeline_engine import build_timeline


DISCLAIMER = "AI insights are informational only and not a substitute for professional medical advice."


def analyze_symptoms(symptoms: list[str], duration: str | None = None, age: int | None = None) -> dict[str, Any]:
    retrieved = retrieve_medical_knowledge(symptoms)
    risk = evaluate_risk(symptoms, [], retrieved, age)
    specialist = recommend_specialist(retrieved, risk)
    conditions = [item["condition"] for item in retrieved] or ["Non-specific symptom pattern"]
    action = _action_for_risk(risk["severity_level"])
    findings = [item["explanation"] for item in retrieved[:3]] or ["No strong knowledge-base match found."]

    return {
        "possible_conditions": conditions,
        "urgency": _urgency(risk["severity_level"]),
        "recommendation": f"Based on retrieved medical knowledge and {', '.join(symptoms) or 'limited inputs'}, {action}",
        "disclaimer": DISCLAIMER,
        "recommended_specialist": specialist,
        "influencing_symptoms": sorted({symptom for item in retrieved for symptom in item["matched_symptoms"]}) or symptoms,
        "retrieved_knowledge": retrieved,
        "trend_changes": compare_symptom_trend(risk["risk_score"]),
        "timeline_events": build_timeline({"type": "Risk change", "title": risk["severity_level"], "detail": f"Current symptom risk score {risk['risk_score']}"}),
        "ai_reasoning_card": build_reasoning_card(symptoms or ["No symptoms supplied"], findings, risk, specialist, action),
        **risk,
    }


def analyze_report(report_name: str, text: str = "") -> dict[str, Any]:
    metrics = parse_report_text(text)
    abnormal = [item for item in metrics if item["status"] != "Normal"]
    normal = [item for item in metrics if item["status"] == "Normal"]
    retrieved = retrieve_medical_knowledge([], metrics)
    risk = evaluate_risk([], metrics, retrieved)
    specialist = recommend_specialist(retrieved, risk, metrics)
    action = _action_for_risk(risk["severity_level"])
    similar_cases = find_similar_cases(metrics)
    trend_changes = compare_report_trends(metrics)
    findings = _report_findings(abnormal, normal)

    return {
        **risk,
        "report_name": report_name,
        "summary": f"Structured parser extracted {len(metrics)} report fields. {len(abnormal)} markers need attention before clinical interpretation.",
        "key_findings": findings,
        "risk_level": "high" if risk["risk_score"] >= 60 else "moderate" if risk["risk_score"] >= 35 else "low",
        "next_steps": [
            action,
            "Compare these values with prior reports and clinical symptoms.",
            "Discuss abnormal markers with a licensed doctor before changing treatment.",
        ],
        "generated_at": datetime.utcnow(),
        "abnormal_values": [_strip_internal(item) for item in abnormal],
        "normal_values": [_strip_internal(item) for item in normal],
        "structured_fields": [_strip_internal(item) for item in metrics],
        "possible_health_insights": [item["explanation"] for item in retrieved] or ["Structured values did not strongly match a high-risk knowledge pattern."],
        "suggested_specialist": specialist,
        "doctor_visit_priority": "High" if risk["severity_level"] in {"High Risk", "Emergency"} else "Medium" if risk["severity_level"] == "Medium Risk" else "Low",
        "patient_friendly_explanation": "EasyMed parsed report markers into structured fields, compared them with prior data, and used local medical knowledge before generating this guidance.",
        "disclaimer": DISCLAIMER,
        "similar_cases": similar_cases,
        "trend_changes": trend_changes,
        "timeline_events": build_timeline({"type": "Report", "title": report_name, "detail": f"Current report risk score {risk['risk_score']}"}),
        "ai_reasoning_card": build_reasoning_card([item["name"] for item in metrics], findings, risk, specialist, action),
    }


def _report_findings(abnormal: list[dict[str, Any]], normal: list[dict[str, Any]]) -> list[str]:
    findings = [f"{item['name']} is {item['status'].lower()} at {item['value']} {item['unit']}." for item in abnormal]
    if normal:
        findings.append(f"{len(normal)} parsed markers are within sample reference ranges.")
    return findings


def _action_for_risk(severity: str) -> str:
    return {
        "Emergency": "Seek emergency care now if symptoms are current, sudden, or severe.",
        "High Risk": "Book an urgent doctor review and carry your report or symptom history.",
        "Medium Risk": "Schedule a doctor visit soon and continue tracking changes.",
        "Low Risk": "Monitor symptoms and keep routine preventive care.",
    }[severity]


def _urgency(severity: str) -> str:
    return "high" if severity in {"High Risk", "Emergency"} else "medium" if severity == "Medium Risk" else "low"


def _strip_internal(metric: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in metric.items() if key != "numeric_value"}
