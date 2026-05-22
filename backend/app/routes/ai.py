from datetime import datetime

from fastapi import APIRouter

from app.models.schemas import EmergencyRiskRequest, EmergencyRiskResponse, ReportSummaryResponse, SymptomRequest, SymptomResponse

router = APIRouter()


@router.post("/summarize-report", response_model=ReportSummaryResponse)
async def summarize_report() -> ReportSummaryResponse:
    return ReportSummaryResponse(
        summary="This is a placeholder AI summary. The report suggests generally stable markers with one or two values to discuss at your next consultation.",
        key_findings=["Vitals look stable.", "One metabolic marker may require follow-up.", "No urgent pattern detected."],
        risk_level="low",
        next_steps=["Book a non-urgent review.", "Keep tracking symptoms.", "Upload older reports for trend comparison."],
        generated_at=datetime.utcnow(),
    )


@router.post("/symptom-checker", response_model=SymptomResponse)
async def symptom_checker(payload: SymptomRequest) -> SymptomResponse:
    symptoms = ", ".join(payload.symptoms) or "the provided symptoms"
    return SymptomResponse(
        possible_conditions=["Seasonal infection", "Fatigue or dehydration", "Stress-related symptoms"],
        urgency="medium" if len(payload.symptoms) >= 3 else "low",
        recommendation=f"Based on {symptoms}, monitor your condition and consider booking a doctor consultation if symptoms persist or worsen.",
        disclaimer="This AI output is for informational use only and is not a medical diagnosis.",
    )


@router.post("/emergency-risk", response_model=EmergencyRiskResponse)
async def emergency_risk(payload: EmergencyRiskRequest) -> EmergencyRiskResponse:
    symptoms = {symptom.lower() for symptom in payload.symptoms}
    value_statuses = {value.status.lower() for value in payload.report_values}
    high_signal_symptoms = {"chest pain", "shortness of breath", "fainting", "severe bleeding", "confusion"}

    if symptoms & high_signal_symptoms:
        severity = "Emergency"
        priority = "Emergency"
        action = "Seek emergency medical help now or call local emergency services."
        emergency = "Do not wait for an online consultation if symptoms are severe, sudden, or worsening."
        specialist = "Emergency Physician"
    elif "high" in value_statuses and len(payload.report_values) >= 2:
        severity = "High Risk"
        priority = "High"
        action = "Book an urgent doctor review and carry your report summary."
        emergency = "Go to emergency care if you develop chest pain, breathlessness, fainting, severe weakness, or confusion."
        specialist = "General Physician or relevant specialist"
    elif len(symptoms) >= 3 or "high" in value_statuses or "low" in value_statuses:
        severity = "Medium Risk"
        priority = "Medium"
        action = "Schedule a doctor visit soon, especially if symptoms persist or values remain abnormal."
        emergency = "Escalate to urgent care if symptoms become severe, sudden, or rapidly worse."
        specialist = "General Physician"
    else:
        severity = "Low Risk"
        priority = "Low"
        action = "Monitor symptoms and maintain routine care."
        emergency = "Emergency care is not suggested by this placeholder result unless severe symptoms appear."
        specialist = "General Physician"

    return EmergencyRiskResponse(
        severity_level=severity,
        suggested_action=action,
        lifestyle_suggestion="Rest, hydrate, avoid self-medication, and keep a written note of symptoms and report values for your doctor.",
        doctor_visit_priority=priority,
        emergency_recommendation=emergency,
        suggested_specialist=specialist,
        simple_explanation="EasyMed looks at symptom urgency and abnormal report values to decide how quickly a doctor should review your case.",
        explain_like_10="Your body is sending signals. If the signals look strong or risky, EasyMed tells you to get help faster.",
        rural_summary="If a clinic is far away, call a local health worker or family doctor first. Travel urgently if breathing, chest pain, fainting, confusion, or severe weakness occurs.",
    )
