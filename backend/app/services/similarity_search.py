import math
from typing import Any

from app.services.data_loader import load_json


def find_similar_cases(metrics: list[dict[str, Any]]) -> list[dict[str, Any]]:
    vector = _vector_from_metrics(metrics)
    cases = []
    for item in load_json("historical_cases.json"):
        similarity = _cosine_similarity(vector, item["findings"])
        cases.append({
            "id": item["id"],
            "label": item["label"],
            "similarity_percentage": round(similarity * 100),
            "matching_findings": _matching_findings(metrics, item["findings"], item["matching_findings"]),
            "outcome": item["outcome"],
        })
    return sorted(cases, key=lambda item: item["similarity_percentage"], reverse=True)[:3]


def _vector_from_metrics(metrics: list[dict[str, Any]]) -> dict[str, float]:
    return {item["name"]: float(item.get("numeric_value") or str(item["value"]).replace(",", "")) for item in metrics}


def _cosine_similarity(left: dict[str, float], right: dict[str, float]) -> float:
    keys = sorted(set(left) & set(right))
    dot = sum(left[key] * right[key] for key in keys)
    left_norm = math.sqrt(sum(left[key] ** 2 for key in keys))
    right_norm = math.sqrt(sum(right[key] ** 2 for key in keys))
    if not left_norm or not right_norm:
        return 0.0
    return dot / (left_norm * right_norm)


def _matching_findings(metrics: list[dict[str, Any]], findings: dict[str, float], labels: list[str]) -> list[str]:
    matched = []
    for metric in metrics:
        current = float(metric.get("numeric_value") or str(metric["value"]).replace(",", ""))
        historical = findings.get(metric["name"])
        if historical and abs(current - historical) / max(historical, 1) <= 0.15:
            matched.append(f"{metric['name']} within 15% of historical case")
    return matched or labels[:2]

