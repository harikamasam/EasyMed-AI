from fastapi import APIRouter

from app.models.schemas import EmergencyRiskRequest, EmergencyRiskResponse, ReportSummaryResponse, SymptomRequest, SymptomResponse
from app.services.ai_service import analyze_report, analyze_symptoms
from app.services.recommendation_service import recommend_specialist
from app.services.retrieval_layer import retrieve_medical_knowledge
from app.services.risk_engine import evaluate_risk

router = APIRouter()


@router.post("/summarize-report", response_model=ReportSummaryResponse)
async def summarize_report() -> ReportSummaryResponse:
    return ReportSummaryResponse(**analyze_report("Medical report"))


@router.post("/symptom-checker", response_model=SymptomResponse)
async def symptom_checker(payload: SymptomRequest) -> SymptomResponse:
    return SymptomResponse(**analyze_symptoms(payload.symptoms, payload.duration, payload.age))


@router.post("/emergency-risk", response_model=EmergencyRiskResponse)
async def emergency_risk(payload: EmergencyRiskRequest) -> EmergencyRiskResponse:
    report_values = [value.model_dump() for value in payload.report_values]
    retrieved = retrieve_medical_knowledge(payload.symptoms, report_values)
    risk = evaluate_risk(payload.symptoms, report_values, retrieved, payload.age)
    specialist = recommend_specialist(retrieved, risk, report_values)
    severity = risk["severity_level"]
    action = {
        "Emergency": "Seek emergency medical help now or call local emergency services.",
        "High Risk": "Book an urgent doctor review and carry your report summary.",
        "Medium Risk": "Schedule a doctor visit soon, especially if symptoms persist or values remain abnormal.",
        "Low Risk": "Monitor symptoms and maintain routine care.",
    }[severity]
    emergency = "Do not wait for an online consultation if symptoms are severe, sudden, or worsening."
    if severity == "Low Risk":
        emergency = "Emergency care is not suggested unless severe symptoms appear."

    return EmergencyRiskResponse(
        risk_score=risk["risk_score"],
        confidence_score=risk["confidence_score"],
        severity_level=severity,
        suggested_action=action,
        lifestyle_suggestion="Rest, hydrate, avoid self-medication, and keep a written note of symptoms and report values for your doctor.",
        doctor_visit_priority=risk["doctor_visit_priority"],
        emergency_recommendation=emergency,
        suggested_specialist=specialist,
        simple_explanation=" ".join(risk["explanation"]),
        explain_like_10="Your body is sending signals. If the signals look strong or risky, EasyMed tells you to get help faster.",
        rural_summary="If a clinic is far away, call a local health worker or family doctor first. Travel urgently if breathing, chest pain, fainting, confusion, or severe weakness occurs.",
        explanation=risk["explanation"],
        risk_factors=risk["risk_factors"],
        inputs_considered=[*payload.symptoms, *[value.name for value in payload.report_values]],
        validation_warnings=risk["validation_warnings"],
    )
