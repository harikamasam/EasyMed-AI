from datetime import datetime

from fastapi import APIRouter, File, UploadFile

from app.models.schemas import ReportSummaryResponse

router = APIRouter()


@router.post("/upload", response_model=ReportSummaryResponse)
async def upload_report(file: UploadFile = File(...)) -> ReportSummaryResponse:
    abnormal_values = [
        {
            "name": "Glucose",
            "value": "142",
            "unit": "mg/dL",
            "reference_range": "70-99 fasting",
            "status": "High",
            "note": "Higher than the typical fasting range in this placeholder analysis.",
        },
        {
            "name": "Vitamin D",
            "value": "18",
            "unit": "ng/mL",
            "reference_range": "30-100",
            "status": "Low",
            "note": "Below the common sufficiency range and worth discussing with a doctor.",
        },
        {
            "name": "Cholesterol",
            "value": "214",
            "unit": "mg/dL",
            "reference_range": "< 200",
            "status": "High",
            "note": "Mildly elevated total cholesterol in this demo result.",
        },
    ]
    normal_values = [
        {
            "name": "Hemoglobin",
            "value": "13.8",
            "unit": "g/dL",
            "reference_range": "12.0-16.0",
            "status": "Normal",
            "note": "Within a typical adult reference range.",
        },
        {
            "name": "WBC Count",
            "value": "6,800",
            "unit": "cells/uL",
            "reference_range": "4,000-11,000",
            "status": "Normal",
            "note": "No infection pattern is suggested by this placeholder value.",
        },
    ]

    return ReportSummaryResponse(
        report_name=file.filename,
        summary=f"AI placeholder analysis for {file.filename}: most blood markers look stable, while glucose, cholesterol, and vitamin D deserve attention during your next medical review.",
        key_findings=[
            "Hemoglobin and WBC Count are within the sample reference ranges.",
            "Glucose is elevated in this demo analysis and may need follow-up if fasting.",
            "Vitamin D appears low and may be linked with fatigue, bone health, or low sunlight exposure.",
            "Total cholesterol is mildly high and should be reviewed with lifestyle and risk factors.",
        ],
        abnormal_values=abnormal_values,
        normal_values=normal_values,
        possible_health_insights=[
            "A glucose value above fasting range can point to impaired sugar control, but diagnosis requires clinical context and repeat testing.",
            "Low vitamin D is common and can often be corrected with doctor-guided supplementation.",
            "Mildly elevated cholesterol is best interpreted alongside LDL, HDL, triglycerides, age, blood pressure, and family history.",
        ],
        suggested_specialist="General Physician or Endocrinologist",
        doctor_visit_priority="Medium",
        patient_friendly_explanation="Your report does not show an emergency pattern in this demo analysis. A few markers are outside their usual ranges, so the safest next step is to review them with a licensed doctor who knows your history.",
        risk_level="moderate",
        next_steps=[
            "Share this report summary with your physician.",
            "Confirm whether the glucose sample was fasting or random.",
            "Ask whether vitamin D supplementation or repeat testing is appropriate.",
            "Compare cholesterol markers with previous reports for trend analysis.",
        ],
        generated_at=datetime.utcnow(),
    )
