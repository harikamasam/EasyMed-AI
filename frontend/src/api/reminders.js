export const reminderFallback = {
  medicine_reminders: [
    {
      id: "mock-med-101",
      type: "medicine",
      medicine_name: "Metformin",
      dosage: "500 mg",
      reminder_time: "08:00 AM",
      frequency: "daily",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: "2026-06-30",
      reminder_note: "Take after breakfast.",
      status: "active",
    },
    {
      id: "mock-med-102",
      type: "medicine",
      medicine_name: "Vitamin D",
      dosage: "1000 IU",
      reminder_time: "09:00 PM",
      frequency: "daily",
      start_date: "2026-05-01",
      end_date: "2026-06-30",
      reminder_note: "Missed yesterday in demo mode.",
      status: "missed",
    },
  ],
  checkup_reminders: [
    {
      id: "mock-check-201",
      type: "checkup",
      checkup_type: "Lipid profile follow-up",
      doctor_or_specialist: "Cardiologist",
      checkup_date: "2026-05-28",
      checkup_time: "10:30 AM",
      notes: "Carry latest cholesterol report.",
      priority: "important",
      status: "active",
    },
  ],
  reminder_logs: [
    {
      id: "mock-log-1",
      reminder_id: "mock-med-101",
      action: "created",
      message: "Medicine reminder created for Metformin.",
      created_at: new Date().toISOString(),
    },
  ],
}

export function getReminderSummary(data) {
  const medicines = data?.medicine_reminders || []
  const checkups = data?.checkup_reminders || []
  const today = new Date().toISOString().slice(0, 10)

  return {
    todayMedicines: medicines.filter((item) => item.status === "active" && item.start_date <= today && item.end_date >= today),
    upcomingCheckups: checkups.filter((item) => item.status === "active").slice(0, 4),
    missedReminders: [...medicines, ...checkups].filter((item) => item.status === "missed"),
    activeCount: [...medicines, ...checkups].filter((item) => item.status === "active").length,
    completedCount: [...medicines, ...checkups].filter((item) => item.status === "completed").length,
  }
}
