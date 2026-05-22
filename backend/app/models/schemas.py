from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Literal["patient"] = "patient"


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


class AppointmentCreate(BaseModel):
    patient_name: str
    doctor: str
    specialty: str
    appointment_date: date
    appointment_time: str
    reason: str


class AppointmentResponse(AppointmentCreate):
    id: str
    status: Literal["confirmed", "pending", "completed"] = "confirmed"


class MedicineReminderCreate(BaseModel):
    medicine_name: str = Field(min_length=2)
    dosage: str = Field(min_length=1)
    reminder_time: str
    frequency: Literal["daily", "weekly", "custom"] = "daily"
    start_date: date
    end_date: date
    reminder_note: str = ""


class CheckupReminderCreate(BaseModel):
    checkup_type: str = Field(min_length=2)
    doctor_or_specialist: str = Field(min_length=2)
    checkup_date: date
    checkup_time: str
    notes: str = ""
    priority: Literal["normal", "important", "urgent"] = "normal"


class ReminderUpdate(BaseModel):
    status: Literal["active", "completed", "snoozed", "missed"] | None = None
    reminder_note: str | None = None
    notes: str | None = None
    reminder_time: str | None = None
    checkup_time: str | None = None


class MedicineReminderResponse(MedicineReminderCreate):
    id: str
    type: Literal["medicine"] = "medicine"
    status: Literal["active", "completed", "snoozed", "missed"] = "active"
    last_taken_at: datetime | None = None
    snoozed_until: datetime | None = None


class CheckupReminderResponse(CheckupReminderCreate):
    id: str
    type: Literal["checkup"] = "checkup"
    status: Literal["active", "completed", "snoozed", "missed"] = "active"
    snoozed_until: datetime | None = None


class ReminderLogResponse(BaseModel):
    id: str
    reminder_id: str
    action: Literal["created", "taken", "snoozed", "completed", "updated", "deleted"]
    message: str
    created_at: datetime


class ReminderCollectionResponse(BaseModel):
    medicine_reminders: list[MedicineReminderResponse]
    checkup_reminders: list[CheckupReminderResponse]
    reminder_logs: list[ReminderLogResponse]


class SymptomRequest(BaseModel):
    symptoms: list[str]
    duration: str
    age: int | None = None


class SymptomResponse(BaseModel):
    possible_conditions: list[str]
    urgency: Literal["low", "medium", "high"]
    recommendation: str
    disclaimer: str


class ReportValueInput(BaseModel):
    name: str
    value: str
    status: str


class EmergencyRiskRequest(BaseModel):
    symptoms: list[str] = Field(default_factory=list)
    report_values: list[ReportValueInput] = Field(default_factory=list)
    duration: str | None = None
    age: int | None = None


class EmergencyRiskResponse(BaseModel):
    severity_level: Literal["Low Risk", "Medium Risk", "High Risk", "Emergency"]
    suggested_action: str
    lifestyle_suggestion: str
    doctor_visit_priority: Literal["Low", "Medium", "High", "Emergency"]
    emergency_recommendation: str
    suggested_specialist: str
    simple_explanation: str
    explain_like_10: str
    rural_summary: str
    language_key: str = "en"
    disclaimer: str = "AI insights are informational only and not a substitute for professional medical advice."


class ReportMetric(BaseModel):
    name: str
    value: str
    unit: str
    reference_range: str
    status: Literal["Normal", "Low", "High"]
    note: str


class ReportSummaryResponse(BaseModel):
    summary: str
    key_findings: list[str]
    risk_level: Literal["low", "moderate", "high"] = "moderate"
    next_steps: list[str]
    generated_at: datetime
    report_name: str = "Medical report"
    abnormal_values: list[ReportMetric] = Field(default_factory=list)
    normal_values: list[ReportMetric] = Field(default_factory=list)
    possible_health_insights: list[str] = Field(default_factory=list)
    suggested_specialist: str = "General Physician"
    doctor_visit_priority: Literal["Low", "Medium", "High"] = "Medium"
    patient_friendly_explanation: str = "AI insights are for informational purposes only. Please consult a licensed doctor."
    disclaimer: str = "AI insights are for informational purposes only. Please consult a licensed doctor."
