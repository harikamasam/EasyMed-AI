MEDICINE_REMINDER_COLLECTION = "medicine_reminders"
CHECKUP_REMINDER_COLLECTION = "checkup_reminders"
REMINDER_LOG_COLLECTION = "reminder_logs"


MEDICINE_REMINDER_INDEXES = [
    ("status", 1),
    ("reminder_time", 1),
    ("start_date", 1),
    ("end_date", 1),
]


CHECKUP_REMINDER_INDEXES = [
    ("status", 1),
    ("checkup_date", 1),
    ("priority", 1),
]


REMINDER_LOG_INDEXES = [
    ("reminder_id", 1),
    ("created_at", -1),
]
