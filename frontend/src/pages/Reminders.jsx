import { BellRing, CalendarCheck, CheckCircle2, Clock, History, Loader2, Pill, Plus, TimerReset, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { api, getApiErrorMessage, isBackendUnavailable } from "../api/client.js"
import { getReminderSummary, reminderFallback } from "../api/reminders.js"
import { MotionCard, MotionPage, Reveal } from "../components/MotionPrimitives.jsx"
import PageHeader from "../components/PageHeader.jsx"
import StatusMessage, { LoadingBlock } from "../components/StatusMessage.jsx"

export default function Reminders() {
  const [data, setData] = useState(reminderFallback)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [fallback, setFallback] = useState(false)

  const summary = useMemo(() => getReminderSummary(data), [data])

  useEffect(() => {
    loadReminders()
  }, [])

  async function loadReminders() {
    setLoading(true)
    setError("")
    try {
      const response = await api.get("/api/reminders")
      setData(response.data)
      setFallback(false)
    } catch (err) {
      if (isBackendUnavailable(err)) {
        setData(reminderFallback)
        setFallback(true)
        setNotice("Backend unavailable, so mock reminder data is being shown.")
      } else {
        setError(getApiErrorMessage(err, "Unable to load reminders."))
      }
    } finally {
      setLoading(false)
    }
  }

  async function createMedicine(event) {
    event.preventDefault()
    await submitCreate(event.currentTarget, "/api/reminders/medicine", "Medicine reminder added.")
  }

  async function createCheckup(event) {
    event.preventDefault()
    await submitCreate(event.currentTarget, "/api/reminders/checkup", "Checkup reminder added.")
  }

  async function submitCreate(form, endpoint, message) {
    const payload = Object.fromEntries(new FormData(form))
    setSaving(endpoint)
    setError("")
    try {
      await api.post(endpoint, payload)
      setNotice(message)
      form.reset()
      await loadReminders()
    } catch (err) {
      if (isBackendUnavailable(err)) {
        setNotice("Backend unavailable, so this reminder was added only in local demo mode.")
        setFallback(true)
        addLocalReminder(endpoint, payload)
        form.reset()
      } else {
        setError(getApiErrorMessage(err, "Unable to save reminder."))
      }
    } finally {
      setSaving("")
    }
  }

  function addLocalReminder(endpoint, payload) {
    const id = `local-${Date.now()}`
    if (endpoint.includes("medicine")) {
      setData((current) => ({
        ...current,
        medicine_reminders: [{ id, type: "medicine", status: "active", ...payload }, ...current.medicine_reminders],
      }))
    } else {
      setData((current) => ({
        ...current,
        checkup_reminders: [{ id, type: "checkup", status: "active", ...payload }, ...current.checkup_reminders],
      }))
    }
  }

  async function action(reminder, actionName) {
    setSaving(`${reminder.id}-${actionName}`)
    setError("")
    try {
      const suffix = actionName === "taken" ? "taken" : "snooze"
      await api.post(`/api/reminders/${reminder.id}/${suffix}`)
      setNotice(actionName === "taken" ? "Medicine marked as taken." : "Reminder snoozed for 30 minutes.")
      await loadReminders()
    } catch (err) {
      if (isBackendUnavailable(err)) {
        const nextStatus = actionName === "taken" ? "completed" : "snoozed"
        setData((current) => updateLocalStatus(current, reminder.id, nextStatus))
        setNotice(actionName === "taken" ? "Marked as taken in local demo mode." : "Snoozed in local demo mode.")
      } else {
        setError(getApiErrorMessage(err, "Unable to update reminder."))
      }
    } finally {
      setSaving("")
    }
  }

  async function removeReminder(reminder) {
    setSaving(`${reminder.id}-delete`)
    try {
      await api.delete(`/api/reminders/${reminder.id}`)
      setNotice("Reminder deleted.")
      await loadReminders()
    } catch (err) {
      if (isBackendUnavailable(err)) {
        setData((current) => ({
          ...current,
          medicine_reminders: current.medicine_reminders.filter((item) => item.id !== reminder.id),
          checkup_reminders: current.checkup_reminders.filter((item) => item.id !== reminder.id),
        }))
        setNotice("Reminder removed in local demo mode.")
      } else {
        setError(getApiErrorMessage(err, "Unable to delete reminder."))
      }
    } finally {
      setSaving("")
    }
  }

  if (loading) return <LoadingBlock label="Loading smart reminders..." />

  return (
    <MotionPage>
      <PageHeader
        eyebrow="Smart Health Reminder System"
        title="Never miss important medicines or checkups"
        description="EasyMed helps patients, elderly people, and busy users never miss important medicines or checkups."
      />

      <div className="mb-6 space-y-3">
        {error && <StatusMessage type="error" title="Reminder error">{error}</StatusMessage>}
        {notice && <StatusMessage type={fallback ? "info" : "success"} title={fallback ? "Demo reminder mode" : "Reminder updated"}>{notice}</StatusMessage>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Pill} label="Today medicines" value={summary.todayMedicines.length} tone="bg-mint text-teal-800" />
        <SummaryCard icon={CalendarCheck} label="Upcoming checkups" value={summary.upcomingCheckups.length} tone="bg-sky-50 text-sky-800" />
        <SummaryCard icon={BellRing} label="Missed reminders" value={summary.missedReminders.length} tone="bg-rose-50 text-rose-800" />
        <SummaryCard icon={CheckCircle2} label="Completed" value={summary.completedCount} tone="bg-violet-50 text-violet-800" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <ReminderForm title="Add Medicine Reminder" icon={Pill} onSubmit={createMedicine} saving={saving === "/api/reminders/medicine"}>
            <Input name="medicine_name" label="Medicine name" defaultValue="Metformin" />
            <Input name="dosage" label="Dosage" defaultValue="500 mg" />
            <Input name="reminder_time" label="Time" defaultValue="08:00 AM" />
            <Select name="frequency" label="Frequency" options={["daily", "weekly", "custom"]} />
            <Input name="start_date" label="Start date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            <Input name="end_date" label="End date" type="date" defaultValue="2026-06-30" />
            <TextArea name="reminder_note" label="Reminder note" defaultValue="Take after breakfast." />
          </ReminderForm>

          <ReminderForm title="Add Checkup Reminder" icon={CalendarCheck} onSubmit={createCheckup} saving={saving === "/api/reminders/checkup"}>
            <Input name="checkup_type" label="Checkup type" defaultValue="Lipid profile follow-up" />
            <Input name="doctor_or_specialist" label="Doctor / specialist" defaultValue="Cardiologist" />
            <Input name="checkup_date" label="Date" type="date" defaultValue="2026-05-28" />
            <Input name="checkup_time" label="Time" defaultValue="10:30 AM" />
            <Select name="priority" label="Priority" options={["normal", "important", "urgent"]} />
            <TextArea name="notes" label="Notes" defaultValue="Carry latest cholesterol report." />
          </ReminderForm>
        </div>

        <div className="space-y-6">
          <AlertPanel medicines={summary.todayMedicines} missed={summary.missedReminders} saving={saving} onTaken={action} onSnooze={action} />
          <ReminderList
            title="Upcoming checkups"
            icon={CalendarCheck}
            items={data.checkup_reminders}
            empty="No checkup reminders yet."
            render={(item) => (
              <ReminderRow
                item={item}
                title={item.checkup_type}
                meta={`${item.doctor_or_specialist} - ${item.checkup_date} at ${item.checkup_time}`}
                badge={item.priority}
                saving={saving}
                onSnooze={action}
                onDelete={removeReminder}
              />
            )}
          />
          <ReminderList
            title="Medicine reminders"
            icon={Pill}
            items={data.medicine_reminders}
            empty="No medicine reminders yet."
            render={(item) => (
              <ReminderRow
                item={item}
                title={`${item.medicine_name} - ${item.dosage}`}
                meta={`${item.frequency} at ${item.reminder_time}`}
                badge={item.status}
                saving={saving}
                onTaken={action}
                onSnooze={action}
                onDelete={removeReminder}
              />
            )}
          />
          <HistoryPanel logs={data.reminder_logs} />
        </div>
      </div>
    </MotionPage>
  )
}

function updateLocalStatus(data, id, status) {
  const update = (items) => items.map((item) => (item.id === id ? { ...item, status } : item))
  return {
    ...data,
    medicine_reminders: update(data.medicine_reminders),
    checkup_reminders: update(data.checkup_reminders),
  }
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <MotionCard className="panel p-5">
      <div className={`mb-4 grid h-11 w-11 place-items-center rounded-lg ${tone}`}>
        <Icon size={22} />
      </div>
      <p className="text-sm font-black text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </MotionCard>
  )
}

function ReminderForm({ title, icon: Icon, children, onSubmit, saving }) {
  return (
    <Reveal>
      <form onSubmit={onSubmit} className="panel p-5">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-teal-800"><Icon size={20} /></span>
          <h2 className="text-xl font-black">{title}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">{children}</div>
        <button className="btn-primary mt-5 w-full" type="submit" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
          {saving ? "Saving..." : "Save reminder"}
        </button>
      </form>
    </Reveal>
  )
}

function AlertPanel({ medicines, missed, saving, onTaken, onSnooze }) {
  const alerts = [...missed, ...medicines].slice(0, 4)
  return (
    <section className="panel overflow-hidden">
      <div className="bg-ink p-5 text-white">
        <p className="flex items-center gap-2 text-sm font-black text-teal-100"><BellRing size={18} /> In-app reminder alerts</p>
        <h2 className="mt-2 text-2xl font-black">Today’s health nudges</h2>
      </div>
      <div className="space-y-3 p-5">
        {alerts.length ? alerts.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black">{item.medicine_name || item.checkup_type}</p>
                <p className="text-sm text-slate-500">{item.reminder_time || item.checkup_time} - {item.status}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.type === "medicine" && (
                  <button className="btn-primary px-3 py-2 text-sm" type="button" disabled={saving === `${item.id}-taken`} onClick={() => onTaken(item, "taken")}>
                    Mark as Taken
                  </button>
                )}
                <button className="btn-secondary px-3 py-2 text-sm" type="button" disabled={saving === `${item.id}-snooze`} onClick={() => onSnooze(item, "snooze")}>
                  Snooze
                </button>
              </div>
            </div>
          </div>
        )) : <EmptyReminder text="No active reminder alerts right now." />}
      </div>
    </section>
  )
}

function ReminderList({ title, icon: Icon, items, empty, render }) {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-teal-800"><Icon size={20} /></span>
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <div className="space-y-3">
        {items.length ? items.map((item) => <div key={item.id}>{render(item)}</div>) : <EmptyReminder text={empty} />}
      </div>
    </section>
  )
}

function ReminderRow({ item, title, meta, badge, saving, onTaken, onSnooze, onDelete }) {
  return (
    <div className="surface-hover rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate font-black">{title}</p>
          <p className="text-sm text-slate-500">{meta}</p>
          <p className="mt-1 text-sm text-slate-500">{item.reminder_note || item.notes}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-700">{badge}</span>
          {item.type === "medicine" && item.status !== "completed" && (
            <button className="btn-secondary px-3 py-2 text-sm" type="button" disabled={saving === `${item.id}-taken`} onClick={() => onTaken(item, "taken")}>
              <CheckCircle2 size={16} />
            </button>
          )}
          <button className="btn-secondary px-3 py-2 text-sm" type="button" disabled={saving === `${item.id}-snooze`} onClick={() => onSnooze(item, "snooze")}>
            <TimerReset size={16} />
          </button>
          <button className="btn-secondary px-3 py-2 text-sm" type="button" disabled={saving === `${item.id}-delete`} onClick={() => onDelete(item)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function HistoryPanel({ logs }) {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-teal-800"><History size={20} /></span>
        <h2 className="text-xl font-black">Reminder history</h2>
      </div>
      <div className="space-y-3">
        {logs.length ? logs.map((log) => (
          <div key={log.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold">{log.message}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{new Date(log.created_at).toLocaleString()}</p>
          </div>
        )) : <EmptyReminder text="Reminder history will appear after actions are taken." />}
      </div>
    </section>
  )
}

function Input({ label, ...props }) {
  return <label className="label">{label}<input className="field mt-2" required {...props} /></label>
}

function TextArea({ label, ...props }) {
  return <label className="label sm:col-span-2">{label}<textarea className="field mt-2 min-h-24" {...props} /></label>
}

function Select({ label, name, options }) {
  return (
    <label className="label">
      {label}
      <select className="field mt-2" name={name}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function EmptyReminder({ text }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm font-semibold text-slate-500">
      <Clock className="mx-auto mb-3 text-aqua" size={24} />
      {text}
    </div>
  )
}
