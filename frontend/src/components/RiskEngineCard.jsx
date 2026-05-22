import { AlertTriangle, HeartPulse, Languages, Mic, ShieldAlert, Sparkles, Stethoscope } from "lucide-react"

const riskClasses = {
  "Low Risk": "border-emerald-200 bg-emerald-50 text-emerald-900",
  "Medium Risk": "border-amber-200 bg-amber-50 text-amber-900",
  "High Risk": "border-rose-200 bg-rose-50 text-rose-900",
  Emergency: "border-red-300 bg-red-50 text-red-950",
}

const priorityClasses = {
  Low: "bg-emerald-100 text-emerald-900",
  Medium: "bg-amber-100 text-amber-900",
  High: "bg-rose-100 text-rose-900",
  Emergency: "bg-red-600 text-white",
}

export const emergencyRiskFallback = {
  severity_level: "Medium Risk",
  suggested_action: "Schedule a doctor visit soon and carry your report or symptom notes.",
  lifestyle_suggestion: "Rest, hydrate, avoid self-medication, and track symptoms clearly.",
  doctor_visit_priority: "Medium",
  emergency_recommendation: "Seek urgent care if symptoms become severe, sudden, or rapidly worse.",
  suggested_specialist: "General Physician",
  simple_explanation: "EasyMed checks symptoms and abnormal values to estimate how quickly a doctor should review them.",
  explain_like_10: "Your body is giving signals. If the signals look stronger, EasyMed tells you to get help faster.",
  rural_summary: "If a clinic is far away, call a local health worker first. Travel urgently for chest pain, breathing trouble, fainting, confusion, or severe weakness.",
  language_key: "en",
  disclaimer: "AI insights are informational only and not a substitute for professional medical advice.",
}

export default function RiskEngineCard({ risk = emergencyRiskFallback, ruralMode = false, explainSimple = false }) {
  const riskClass = riskClasses[risk.severity_level] || riskClasses["Medium Risk"]

  return (
    <section className={`panel animate-soft-in overflow-hidden border-2 ${riskClass}`}>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em]">
              <ShieldAlert size={18} />
              Emergency Health Risk Engine
            </p>
            <h2 className={`${ruralMode ? "text-4xl" : "text-3xl"} mt-3 font-black`}>{risk.severity_level}</h2>
          </div>
          <span className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-black ${priorityClasses[risk.doctor_visit_priority] || priorityClasses.Medium}`}>
            Priority: {risk.doctor_visit_priority}
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <RiskItem icon={HeartPulse} label="Suggested Action" value={risk.suggested_action} ruralMode={ruralMode} />
          <RiskItem icon={Stethoscope} label="Suggested Specialist" value={risk.suggested_specialist} ruralMode={ruralMode} />
          <RiskItem icon={Sparkles} label="Lifestyle Suggestion" value={risk.lifestyle_suggestion} ruralMode={ruralMode} />
          <RiskItem icon={AlertTriangle} label="Emergency Recommendation" value={risk.emergency_recommendation} ruralMode={ruralMode} />
        </div>

        <div className="mt-5 rounded-lg border border-current/20 bg-white/70 p-4">
          <p className="font-black">{explainSimple ? "Explain Like I am 10" : "Patient-friendly medical explanation"}</p>
          <p className={`${ruralMode ? "text-lg leading-8" : "text-sm leading-6"} mt-2`}>{explainSimple ? risk.explain_like_10 : risk.simple_explanation}</p>
        </div>

        {ruralMode && (
          <div className="mt-4 rounded-lg border border-current/20 bg-white/75 p-4">
            <p className="flex items-center gap-2 font-black">
              <Languages size={18} />
              Rural accessibility summary
            </p>
            <p className="mt-2 text-lg leading-8">{risk.rural_summary}</p>
          </div>
        )}

        <p className="mt-5 text-xs font-bold leading-5 opacity-80">{risk.disclaimer}</p>
      </div>
    </section>
  )
}

export function RuralAccessibilityToolbar({ ruralMode, explainSimple, onToggleRural, onToggleExplain }) {
  return (
    <div className="panel animate-soft-in p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-aqua">Rural accessibility mode</p>
          <p className="mt-1 text-sm text-slate-600">Larger text, simple summaries, voice-ready controls, and multilingual-ready labels.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onToggleRural} className={ruralMode ? "btn-primary" : "btn-secondary"}>
            <Languages size={18} />
            {ruralMode ? "Readable Mode On" : "Readable Mode"}
          </button>
          <button type="button" onClick={onToggleExplain} className={explainSimple ? "btn-primary" : "btn-secondary"}>
            <Sparkles size={18} />
            Explain Like I am 10
          </button>
          <button type="button" className="btn-secondary" aria-label="Voice input placeholder">
            <Mic size={18} />
            Voice Input
          </button>
        </div>
      </div>
    </div>
  )
}

export function MedicalExplanationList({ items, ruralMode = false }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.term} className="surface-hover rounded-lg border border-slate-200 bg-white p-4">
          <p className="font-black">{item.term}</p>
          <p className={`${ruralMode ? "text-lg leading-8" : "text-sm leading-6"} mt-2 text-slate-600`}>{item.simple}</p>
        </div>
      ))}
    </div>
  )
}

function RiskItem({ icon: Icon, label, value, ruralMode }) {
  return (
    <div className="rounded-lg border border-current/20 bg-white/70 p-4">
      <Icon size={20} />
      <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className={`${ruralMode ? "text-lg leading-8" : "text-sm leading-6"} mt-2 font-semibold`}>{value}</p>
    </div>
  )
}
