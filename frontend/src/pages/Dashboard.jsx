import {
  Activity,
  Brain,
  CalendarClock,
  CheckCircle2,
  FileText,
  HeartPulse,
  Pill,
  Plus,
  Sparkles,
  Stethoscope,
  Upload,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getCurrentUser } from "../api/auth.js"
import { api, getApiErrorMessage, isBackendUnavailable } from "../api/client.js"
import { getReminderSummary, reminderFallback } from "../api/reminders.js"
import { MotionCard, MotionPage, Reveal } from "../components/MotionPrimitives.jsx"
import PageHeader from "../components/PageHeader.jsx"
import StatusMessage, { LoadingBlock } from "../components/StatusMessage.jsx"

const fallback = {
  patient: { name: "Demo Patient", careScore: 86, riskTrend: "stable" },
  reports: [
    { id: "fallback-rpt-101", title: "Blood Panel", date: "2026-05-08", status: "Summarized" },
    { id: "fallback-rpt-102", title: "Lipid Profile", date: "2026-04-28", status: "Needs review" },
  ],
  appointments: [
    { id: "fallback-apt-201", doctor: "Dr. Meera Rao", specialty: "Cardiology", date: "2026-05-24", time: "10:30 AM" },
  ],
  reminders: [
    { id: "fallback-rem-301", label: "Take Vitamin D", time: "8:00 PM" },
    { id: "fallback-rem-302", label: "Upload glucose reading", time: "Tomorrow" },
  ],
  insights: [
    "Backend unavailable: showing mock AI care insights.",
    "Your recent cholesterol markers are trending down.",
    "Follow-up recommended for lipid profile within 30 days.",
  ],
  timeline: [
    { id: "fallback-current", date: "2026-06-02", type: "Appointment", title: "General physician review", detail: "General Medicine" },
    { id: "fallback-risk", date: "2026-05-22", type: "Risk change", title: "Medium Risk", detail: "Risk score 44" },
    { id: "fallback-report", date: "2026-05-08", type: "Report", title: "Blood Panel", detail: "Risk score 47" },
  ],
}

export default function Dashboard() {
  const [data, setData] = useState(() => ({
    ...fallback,
    patient: { ...fallback.patient, name: getCurrentUser()?.name || fallback.patient.name },
  }))
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [reminderData, setReminderData] = useState(reminderFallback)

  useEffect(() => {
    let active = true
    async function loadDashboard() {
      setLoading(true)
      setError("")
      setNotice("")
      try {
        const response = await api.get("/api/dashboard")
        const reminderResponse = await api.get("/api/reminders")
        if (active) {
          setData(response.data)
          setReminderData(reminderResponse.data)
        }
      } catch (err) {
        if (!active) return
        if (isBackendUnavailable(err)) {
          setData({
            ...fallback,
            patient: { ...fallback.patient, name: getCurrentUser()?.name || fallback.patient.name },
          })
          setReminderData(reminderFallback)
          setNotice("Backend unavailable, so mock dashboard data is being shown.")
        } else {
          setError(getApiErrorMessage(err, "Unable to load dashboard data."))
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    loadDashboard()
    return () => {
      active = false
    }
  }, [])

  if (loading) return <LoadingBlock label="Preparing your AI healthcare workspace..." />

  const activity = [
    ...data.reports.slice(0, 2).map((report) => ({ id: `activity-${report.id}`, title: report.title, meta: `Report ${report.status}`, date: report.date })),
    ...data.appointments.slice(0, 2).map((appointment) => ({ id: `activity-${appointment.id}`, title: appointment.doctor, meta: appointment.specialty, date: appointment.date })),
  ]
  const reminderSummary = getReminderSummary(reminderData)

  return (
    <MotionPage>
      <PageHeader
        eyebrow="Patient command center"
        title={`Welcome back, ${data.patient.name}`}
        description="Your AI-powered health workspace is ready with smart insights, care reminders, reports, and appointments."
      />

      <div className="mb-6 space-y-3">
        {notice && <StatusMessage type="info" title="Demo fallback active">{notice}</StatusMessage>}
        {error && <StatusMessage type="error" title="Dashboard error">{error}</StatusMessage>}
      </div>

      <Reveal>
        <section className="glass-card mb-6 overflow-hidden p-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-black text-teal-800">
                <Sparkles size={16} />
                Powered by AI
              </div>
              <h2 className="text-3xl font-black sm:text-4xl">Today’s health summary</h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Care score is stable, reports are organized, and EasyMed is watching for signals that may need a doctor review.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/reports" className="btn-primary">
                  <Upload size={18} />
                  Upload report
                </Link>
                <Link to="/appointments" className="btn-secondary">
                  <Plus size={18} />
                  Book appointment
                </Link>
              </div>
            </div>
            <HealthChart score={data.patient.careScore} />
          </div>
        </section>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={HeartPulse} label="Care score" value={data.patient.careScore} tone="bg-mint text-teal-800" />
        <Metric icon={Brain} label="Risk trend" value={data.patient.riskTrend} tone="bg-sky-50 text-sky-800" />
        <Metric icon={Pill} label="Today medicines" value={reminderSummary.todayMedicines.length} tone="bg-violet-50 text-violet-800" />
        <Metric icon={CalendarClock} label="Checkups" value={reminderSummary.upcomingCheckups.length} tone="bg-rose-50 text-rose-800" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <ReminderPreview
          title="Today’s medicine reminders"
          icon={Pill}
          items={reminderSummary.todayMedicines}
          empty="No medicines due today."
          render={(item) => `${item.medicine_name} - ${item.dosage} at ${item.reminder_time}`}
        />
        <ReminderPreview
          title="Upcoming checkups"
          icon={CalendarClock}
          items={reminderSummary.upcomingCheckups}
          empty="No checkups scheduled."
          render={(item) => `${item.checkup_type} with ${item.doctor_or_specialist}`}
        />
        <ReminderPreview
          title="Missed reminders"
          icon={BellIcon}
          items={reminderSummary.missedReminders}
          empty="No missed reminders."
          render={(item) => item.medicine_name || item.checkup_type}
          urgent
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <section className="panel p-5">
            <SectionTitle icon={Brain} title="Smart insights" badge="AI analysis" />
            {data.insights.length ? (
              <div className="mt-4 space-y-3">
                {data.insights.map((insight) => (
                  <div key={insight} className="surface-hover flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-aqua" size={20} />
                    <p className="text-slate-700">{insight}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Brain} title="No AI insights yet" text="Upload reports or check symptoms to generate smart insights." action="/reports" actionLabel="Upload report" />
            )}
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <ProfileCard patient={data.patient} />
        </Reveal>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DataPanel
          title="Recent reports"
          icon={FileText}
          items={data.reports}
          empty={<EmptyState icon={FileText} title="No reports uploaded yet" text="Start with a lab report to unlock EasyMed’s report intelligence." action="/reports" actionLabel="Upload report" />}
          render={(report) => (
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-bold">{report.title}</p>
                <p className="text-sm text-slate-500">{report.date}</p>
              </div>
              <span className="rounded-full bg-mint px-3 py-1 text-xs font-black text-teal-800">{report.status}</span>
            </div>
          )}
        />
        <DataPanel
          title="Appointments"
          icon={CalendarClock}
          items={data.appointments}
          empty={<EmptyState icon={CalendarClock} title="No appointments scheduled" text="Book a visit when reports or symptoms need professional review." action="/appointments" actionLabel="Book appointment" />}
          render={(appointment) => (
            <div>
              <p className="font-bold">{appointment.doctor}</p>
              <p className="text-sm text-slate-500">{appointment.specialty}</p>
              <p className="mt-2 text-sm font-black text-aqua">{appointment.date} at {appointment.time}</p>
            </div>
          )}
        />
        <DataPanel
          title="Recent activity"
          icon={Activity}
          items={activity}
          empty={<EmptyState icon={Activity} title="No recent activity" text="Your report uploads, bookings, and AI analysis history will appear here." />}
          render={(item) => (
            <div className="relative pl-5">
              <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-aqua" />
              <p className="font-bold">{item.title}</p>
              <p className="text-sm text-slate-500">{item.meta}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">{item.date}</p>
            </div>
          )}
        />
      </div>

      <div className="mt-6">
        <HealthTimeline events={data.timeline || []} />
      </div>
    </MotionPage>
  )
}

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <MotionCard className="panel p-5">
      <div className={`mb-5 inline-grid h-11 w-11 place-items-center rounded-lg ${tone}`}>
        <Icon size={22} />
      </div>
      <p className="text-sm font-black text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black capitalize">{value}</p>
    </MotionCard>
  )
}

function HealthChart({ score }) {
  const bars = [52, 64, 58, 72, 76, 82, score]
  return (
    <div className="rounded-lg border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-slate-500">Health momentum</p>
          <p className="mt-1 text-3xl font-black">{score}</p>
        </div>
        <HeartPulse className="text-aqua" size={32} />
      </div>
      <div className="mt-6 flex h-32 items-end gap-3">
        {bars.map((bar, index) => (
          <div key={`${bar}-${index}`} className="flex-1 rounded-t-lg bg-gradient-to-t from-aqua to-mint" style={{ height: `${bar}%` }} />
        ))}
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title, badge }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-teal-800">
          <Icon size={20} />
        </span>
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      {badge && <span className="w-fit rounded-full bg-ink px-3 py-1 text-xs font-black text-white">{badge}</span>}
    </div>
  )
}

function ProfileCard({ patient }) {
  return (
    <section className="panel p-5">
      <SectionTitle icon={Stethoscope} title="Profile" badge="Personalized" />
      <div className="mt-5 flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-aqua to-teal-700 text-2xl font-black text-white">
          {patient.name[0]}
        </div>
        <div>
          <p className="text-xl font-black">{patient.name}</p>
          <p className="text-sm font-semibold text-slate-500">AI care workspace active</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link to="/symptoms" className="btn-secondary px-3 py-2 text-sm">Check symptoms</Link>
        <Link to="/reports" className="btn-secondary px-3 py-2 text-sm">Analyze report</Link>
      </div>
      <div className="mt-5 rounded-lg bg-slate-50 p-4">
        <p className="text-sm font-black text-slate-500">Health summary</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">Stable trend, medium monitoring priority, report review recommended when new labs are available.</p>
      </div>
    </section>
  )
}

function DataPanel({ title, icon, items, empty, render }) {
  const Icon = icon
  return (
    <Reveal>
      <section className="panel p-5">
        <SectionTitle icon={Icon} title={title} />
        {items.length ? (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="surface-hover rounded-lg border border-slate-200 bg-white p-4">
                {render(item)}
              </div>
            ))}
          </div>
        ) : (
          empty
        )}
      </section>
    </Reveal>
  )
}

function EmptyState({ icon: Icon, title, text, action, actionLabel }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-white text-aqua shadow-sm">
        <Icon size={24} />
      </span>
      <p className="mt-4 font-black">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
      {action && (
        <Link to={action} className="btn-primary mt-4 px-4 py-2 text-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

function ReminderPreview({ title, icon: Icon, items, empty, render, urgent = false }) {
  return (
    <Reveal>
      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`grid h-10 w-10 place-items-center rounded-lg ${urgent ? "bg-rose-50 text-rose-800" : "bg-mint text-teal-800"}`}>
              <Icon size={20} />
            </span>
            <h2 className="text-lg font-black">{title}</h2>
          </div>
          <Link to="/reminders" className="text-sm font-black text-aqua">Manage</Link>
        </div>
        <div className="space-y-3">
          {items.length ? items.slice(0, 3).map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="font-bold">{render(item)}</p>
              <p className="mt-1 text-xs font-semibold capitalize text-slate-500">{item.status}</p>
            </div>
          )) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-500">{empty}</div>
          )}
        </div>
      </section>
    </Reveal>
  )
}

function BellIcon(props) {
  return <Activity {...props} />
}

function HealthTimeline({ events }) {
  return (
    <Reveal>
      <section className="panel p-5">
        <SectionTitle icon={Activity} title="Health timeline" badge="Chronological" />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {events.map((event) => (
            <article key={event.id} className="relative rounded-lg border border-slate-200 bg-white p-4">
              <span className="absolute right-4 top-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{event.type}</span>
              <p className="pr-24 text-sm font-black text-aqua">{event.date}</p>
              <h3 className="mt-3 font-black">{event.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{event.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </Reveal>
  )
}
