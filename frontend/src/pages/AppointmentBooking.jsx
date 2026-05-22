import { CalendarCheck, Clock, Loader2, UserRound } from "lucide-react"
import { useState } from "react"
import { api, getApiErrorMessage, isBackendUnavailable } from "../api/client.js"
import PageHeader from "../components/PageHeader.jsx"
import StatusMessage from "../components/StatusMessage.jsx"

export default function AppointmentBooking() {
  const [confirmation, setConfirmation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [fallback, setFallback] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    setFallback(false)
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form)
    try {
      const response = await api.post("/api/appointments", payload)
      setConfirmation(response.data)
      setSuccess("Appointment booked successfully.")
    } catch (err) {
      if (isBackendUnavailable(err)) {
        setFallback(true)
        setConfirmation({ ...payload, id: "demo-appointment", status: "confirmed" })
        setSuccess("Backend unavailable, so a mock appointment confirmation was created.")
      } else {
        setError(getApiErrorMessage(err, "Appointment booking failed. Please check the form and try again."))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Care access"
        title="Book an appointment"
        description="Schedule a consultation based on symptoms, report findings, or routine follow-up needs."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <form onSubmit={handleSubmit} className="panel animate-soft-in grid gap-5 p-6 sm:grid-cols-2">
          <div className="space-y-3 sm:col-span-2">
            {error && <StatusMessage type="error" title="Booking failed">{error}</StatusMessage>}
            {success && <StatusMessage type={fallback ? "info" : "success"} title={fallback ? "Demo fallback active" : "Appointment confirmed"}>{success}</StatusMessage>}
          </div>
          <div>
            <label className="label">Patient name</label>
            <input className="field mt-2" name="patient_name" defaultValue="Aarav Sharma" required />
          </div>
          <div>
            <label className="label">Doctor</label>
            <select className="field mt-2" name="doctor" defaultValue="Dr. Meera Rao">
              <option>Dr. Meera Rao</option>
              <option>Dr. Neil Kapoor</option>
              <option>Dr. Sara Menon</option>
            </select>
          </div>
          <div>
            <label className="label">Specialty</label>
            <select className="field mt-2" name="specialty" defaultValue="Cardiology">
              <option>Cardiology</option>
              <option>General Medicine</option>
              <option>Endocrinology</option>
              <option>Dermatology</option>
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input className="field mt-2" name="appointment_date" type="date" defaultValue="2026-05-24" required />
          </div>
          <div>
            <label className="label">Time</label>
            <input className="field mt-2" name="appointment_time" defaultValue="10:30 AM" required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Reason</label>
            <textarea className="field mt-2 min-h-28" name="reason" defaultValue="Follow up on AI report summary and lipid profile." />
          </div>
          <button className="btn-primary sm:col-span-2" type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <CalendarCheck size={20} />}
            {loading ? "Booking appointment..." : "Confirm booking"}
          </button>
        </form>

        <section className="panel animate-soft-in p-6">
          <h2 className="text-2xl font-bold">Booking summary</h2>
          {confirmation ? (
            <div className="mt-5 space-y-4">
              <Summary icon={UserRound} label="Doctor" value={`${confirmation.doctor} - ${confirmation.specialty}`} />
              <Summary icon={Clock} label="When" value={`${confirmation.appointment_date} at ${confirmation.appointment_time}`} />
              <div className="rounded-lg bg-mint p-5">
                <p className="text-sm font-bold text-teal-800">Status</p>
                <p className="mt-2 text-2xl font-black capitalize text-teal-950">{confirmation.status}</p>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-600">Your appointment confirmation will appear here.</p>
          )}
        </section>
      </div>
    </>
  )
}

function Summary({ icon: Icon, label, value }) {
  return (
    <div className="surface-hover flex gap-3 rounded-lg border border-slate-200 p-4">
      <Icon className="mt-0.5 shrink-0 text-aqua" size={20} />
      <div>
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  )
}
