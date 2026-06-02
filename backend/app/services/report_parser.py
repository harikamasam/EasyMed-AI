import re
from typing import Any


REFERENCE_RANGES = {
    "Hemoglobin": {"unit": "g/dL", "low": 12.0, "high": 16.0, "range": "12.0-16.0"},
    "Glucose": {"unit": "mg/dL", "low": 70.0, "high": 99.0, "range": "70-99 fasting"},
    "Cholesterol": {"unit": "mg/dL", "low": 0.0, "high": 200.0, "range": "< 200"},
    "Vitamin D": {"unit": "ng/mL", "low": 30.0, "high": 100.0, "range": "30-100"},
    "WBC Count": {"unit": "cells/uL", "low": 4000.0, "high": 11000.0, "range": "4,000-11,000"},
}

ALIASES = {
    "Hemoglobin": ["hemoglobin", "hb"],
    "Glucose": ["glucose", "blood sugar", "fasting glucose"],
    "Cholesterol": ["cholesterol", "total cholesterol"],
    "Vitamin D": ["vitamin d", "25-oh vitamin d"],
    "WBC Count": ["wbc", "white blood cells", "wbc count"],
}

DEMO_VALUES = {
    "Hemoglobin": 13.8,
    "Glucose": 142,
    "Cholesterol": 214,
    "Vitamin D": 18,
    "WBC Count": 6800,
}


def parse_report_text(text: str = "") -> list[dict[str, Any]]:
    values = {name: _extract_value(text, aliases) for name, aliases in ALIASES.items()}
    parsed = []
    for name, value in values.items():
        numeric_value = value if value is not None else DEMO_VALUES[name]
        parsed.append(_build_metric(name, numeric_value, value is None))
    return parsed


def _extract_value(text: str, aliases: list[str]) -> float | None:
    for alias in aliases:
        pattern = rf"{re.escape(alias)}\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)"
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return float(match.group(1))
    return None


def _build_metric(name: str, value: float, inferred: bool) -> dict[str, Any]:
    reference = REFERENCE_RANGES[name]
    status = "Normal"
    if value < reference["low"]:
        status = "Low"
    elif value > reference["high"]:
        status = "High"

    notes = {
        "Normal": f"{name} is within the sample reference range.",
        "Low": f"{name} is below the sample reference range and should be reviewed with clinical context.",
        "High": f"{name} is above the sample reference range and should be reviewed with clinical context.",
    }
    note = notes[status]
    if inferred:
        note = f"Demo parser value used because this upload cannot be OCR-read locally. {note}"

    return {
        "name": name,
        "value": f"{value:g}",
        "numeric_value": value,
        "unit": reference["unit"],
        "reference_range": reference["range"],
        "status": status,
        "note": note,
    }

