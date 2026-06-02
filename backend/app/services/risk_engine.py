from typing import Any


SEVERITY_ORDER = {"Low Risk": 1, "Medium Risk": 2, "High Risk": 3, "Emergency": 4}


def evaluate_risk(symptoms: list[str], report_values: list[dict[str, Any]], retrieved: list[dict[str, Any]], age: int | None = None) -> dict[str, Any]:
    symptom_set = {symptom.lower() for symptom in symptoms}
    risk_score = min(len(symptom_set) * 7, 25)
    explanations = []
    risk_factors = []

    emergency_symptoms = {"chest pain", "shortness of breath", "fainting", "confusion", "severe bleeding"}
    matched_emergency = sorted(symptom_set & emergency_symptoms)
    if matched_emergency:
        risk_score += 35
        risk_factors.extend(matched_emergency)
        explanations.append(f"{' + '.join(matched_emergency)} increased risk score.")

    for value in report_values:
        status = str(value.get("status", "")).lower()
        name = str(value.get("name", "Report marker"))
        if status == "high":
            risk_score += 12
            risk_factors.append(f"High {name}")
            explanations.append(f"High {name} increased risk score.")
        elif status == "low":
            risk_score += 9
            risk_factors.append(f"Low {name}")
            explanations.append(f"Low {name} increased risk score.")

    for item in retrieved[:2]:
        risk_score += item["retrieval_score"] * 4
        if item["matched_symptoms"]:
            explanations.append(f"{' + '.join(item['matched_symptoms'])} matched {item['condition']}.")

    if age and age >= 65:
        risk_score += 8
        risk_factors.append("Age 65+")
        explanations.append("Age 65+ increased review priority.")

    risk_score = max(5, min(100, risk_score))
    severity_level = _severity_from_score(risk_score, retrieved)
    confidence_score = _confidence(symptoms, report_values, retrieved)
    warnings = _validation_warnings(symptoms, report_values, confidence_score)

    return {
        "risk_score": risk_score,
        "confidence_score": confidence_score,
        "severity_level": severity_level,
        "doctor_visit_priority": "Emergency" if severity_level == "Emergency" else severity_level.replace(" Risk", ""),
        "risk_factors": risk_factors or ["No high-signal risk factor detected"],
        "explanation": explanations or ["No high-risk symptoms or abnormal report markers were detected."],
        "validation_warnings": warnings,
    }


def _severity_from_score(score: int, retrieved: list[dict[str, Any]]) -> str:
    retrieved_severity = max((item["severity"] for item in retrieved), key=lambda item: SEVERITY_ORDER.get(item, 0), default="Low Risk")
    score_severity = "Emergency" if score >= 80 else "High Risk" if score >= 60 else "Medium Risk" if score >= 35 else "Low Risk"
    return max([retrieved_severity, score_severity], key=lambda item: SEVERITY_ORDER.get(item, 0))


def _confidence(symptoms: list[str], report_values: list[dict[str, Any]], retrieved: list[dict[str, Any]]) -> int:
    score = 45 + min(len(symptoms) * 6, 18) + min(len(report_values) * 5, 20) + min(len(retrieved) * 5, 15)
    return min(96, score)


def _validation_warnings(symptoms: list[str], report_values: list[dict[str, Any]], confidence: int) -> list[str]:
    warnings = []
    if not symptoms and not report_values:
        warnings.append("No symptoms or report values were provided, so confidence is limited.")
    if symptoms and not report_values:
        warnings.append("Report values are missing; recommendation is based on symptoms only.")
    if report_values and not symptoms:
        warnings.append("Symptoms are missing; report risk is interpreted without current complaints.")
    if any(str(value.get("status", "")).lower() in {"high", "low"} for value in report_values) and confidence < 70:
        warnings.append("Abnormal report values need a clinician's context before firm interpretation.")
    return warnings

