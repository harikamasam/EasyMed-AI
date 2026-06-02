from fastapi import APIRouter, File, UploadFile

from app.models.schemas import ReportSummaryResponse
from app.services.ai_service import analyze_report

router = APIRouter()


@router.post("/upload", response_model=ReportSummaryResponse)
async def upload_report(file: UploadFile = File(...)) -> ReportSummaryResponse:
    raw_bytes = await file.read()
    text = raw_bytes.decode("utf-8", errors="ignore")
    return ReportSummaryResponse(**analyze_report(file.filename, text))
