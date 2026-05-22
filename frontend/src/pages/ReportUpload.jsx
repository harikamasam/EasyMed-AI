import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Download,
  FileHeart,
  FileText,
  FileUp,
  Loader2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react"
import { useMemo, useState } from "react"
import { api, getApiErrorMessage, isBackendUnavailable } from "../api/client.js"
import PageHeader from "../components/PageHeader.jsx"
import RiskEngineCard, {
  MedicalExplanationList,
  RuralAccessibilityToolbar,
  emergencyRiskFallback,
} from "../components/RiskEngineCard.jsx"
import StatusMessage from "../components/StatusMessage.jsx"

const allowedTypes = ["application/pdf", "image/png", "image/jpeg"]
const maxFileSize = 10 * 1024 * 1024

const mockAnalysis = {
  report_name: "demo-blood-report.pdf",
  summary:
    "Demo fallback analysis: most values appear stable, while glucose, cholesterol, and vitamin D deserve attention during your next medical review.",
  key_findings: [
    "Hemoglobin and WBC Count are within sample reference ranges.",
    "Glucose is elevated in this demo analysis and may need follow-up if fasting.",
    "Vitamin D appears low and should be reviewed with a doctor.",
    "Total cholesterol is mildly high and should be interpreted with LDL, HDL, triglycerides, and history.",
  ],
  abnormal_values: [
    {
      name: "Glucose",
      value: "142",
      unit: "mg/dL",
      reference_range: "70-99 fasting",
      status: "High",
      note: "Higher than the typical fasting range in this placeholder analysis.",
    },
    {
      name: "Cholesterol",
      value: "214",
      unit: "mg/dL",
      reference_range: "< 200",
      status: "High",
      note: "Mildly elevated total cholesterol in this demo result.",
    },
    {
      name: "Vitamin D",
      value: "18",
      unit: "ng/mL",
      reference_range: "30-100",
      status: "Low",
      note: "Below the common sufficiency range.",
    },
  ],
  normal_values: [
    {
      name: "Hemoglobin",
      value: "13.8",
      unit: "g/dL",
      reference_range: "12.0-16.0",
      status: "Normal",
      note: "Within a typical adult reference range.",
    },
    {
      name: "WBC Count",
      value: "6,800",
      unit: "cells/uL",
      reference_range: "4,000-11,000",
      status: "Normal",
      note: "No infection pattern is suggested by this placeholder value.",
    },
  ],
  possible_health_insights: [
    "A high glucose value can point to impaired sugar control, but diagnosis requires clinical context and repeat testing.",
    "Low vitamin D can be associated with fatigue, bone health concerns, or low sunlight exposure.",
    "Mild cholesterol elevation is best reviewed with lifestyle, blood pressure, age, and family history.",
  ],
  suggested_specialist: "General Physician or Endocrinologist",
  doctor_visit_priority: "Medium",
  patient_friendly_explanation:
    "Your report does not show an emergency pattern in this demo analysis. A few markers are outside their usual ranges, so the safest next step is to review them with a licensed doctor who knows your health history.",
  next_steps: [
    "Share this report summary with your physician.",
    "Confirm whether the glucose sample was fasting or random.",
    "Ask whether vitamin D supplementation or repeat testing is appropriate.",
  ],
  generated_at: new Date().toISOString(),
  disclaimer: "AI insights are for informational purposes only. Please consult a licensed doctor.",
}

export default function ReportUpload() {
  const [file, setFile] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [fallback, setFallback] = useState(false)
  const [risk, setRisk] = useState(null)
  const [ruralMode, setRuralMode] = useState(false)
  const [explainSimple, setExplainSimple] = useState(false)
  const [history, setHistory] = useState([
    { id: "hist-1", name: "Annual blood panel.pdf", priority: "Low", date: "2026-05-08" },
    { id: "hist-2", name: "Vitamin profile.png", priority: "Medium", date: "2026-04-22" },
  ])

  const fileMeta = useMemo(() => {
    if (!file) return null
    return {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type.includes("pdf") ? "PDF report" : "Image report",
    }
  }, [file])

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0]
    setError("")
    setSuccess("")

    if (!selectedFile) return

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null)
      setError("Please upload a PDF, JPG, or PNG medical report.")
      return
    }

    if (selectedFile.size > maxFileSize) {
      setFile(null)
      setError("Please upload a file under 10 MB.")
      return
    }

    setFile(selectedFile)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!file) {
      setError("Choose a medical report before starting analysis.")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")
    setFallback(false)

    const payload = new FormData()
    payload.append("file", file)

    try {
      const response = await api.post("/api/reports/upload", payload)
      const result = normalizeAnalysis(response.data, file.name)
      const riskResponse = await api.post("/api/emergency-risk", {
        symptoms: [],
        report_values: [...result.abnormal_values, ...result.normal_values].map((value) => ({
          name: value.name,
          value: `${value.value} ${value.unit}`,
          status: value.status,
        })),
      })
      setAnalysis(result)
      setRisk(riskResponse.data)
      addHistory(result, false)
      setSuccess("AI report intelligence completed successfully.")
    } catch (err) {
      if (isBackendUnavailable(err)) {
        const result = normalizeAnalysis({ ...mockAnalysis, report_name: file.name }, file.name)
        setFallback(true)
        setAnalysis(result)
        setRisk({
          ...emergencyRiskFallback,
          severity_level: "High Risk",
          doctor_visit_priority: "High",
          suggested_specialist: result.suggested_specialist,
          suggested_action: "Book a doctor review soon because multiple report values are outside the sample range.",
          simple_explanation: "Some report numbers are higher or lower than expected. A doctor can explain why and what to do next.",
          explain_like_10: "Some numbers in your report are not in the usual zone. A doctor should check them with you.",
        })
        addHistory(result, true)
        setSuccess("Backend unavailable, so EasyMed generated a mock medical intelligence report.")
      } else {
        setError(getApiErrorMessage(err, "Report analysis failed. Please try another PDF or image."))
      }
    } finally {
      setLoading(false)
    }
  }

  function addHistory(result, isMock) {
    setHistory((current) => [
      {
        id: `${Date.now()}`,
        name: result.report_name,
        priority: result.doctor_visit_priority,
        date: new Date().toISOString().slice(0, 10),
        isMock,
      },
      ...current.slice(0, 4),
    ])
  }

  function downloadDoctorSummary() {
    if (!analysis) return
    const content = buildDoctorSummary(analysis)
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${analysis.report_name.replace(/\.[^/.]+$/, "")}-doctor-summary.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeader
        eyebrow="AI Medical Report Intelligence"
        title="Understand your medical report in minutes"
        description="Upload a PDF or image report and EasyMed turns complex lab markers into structured, patient-friendly insights for your doctor visit."
        action={
          analysis && (
            <button type="button" onClick={downloadDoctorSummary} className="btn-secondary">
              <Download size={18} />
              Download Doctor Summary
            </button>
          )
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <HeroStat icon={Brain} label="Structured AI analysis" value="12+ signals" />
        <HeroStat icon={ShieldCheck} label="Clinical disclaimer" value="Doctor-first" />
        <HeroStat icon={Activity} label="Emergency risk" value={risk?.severity_level || "Pending"} />
      </div>

      <div className="mb-6">
        <RuralAccessibilityToolbar
          ruralMode={ruralMode}
          explainSimple={explainSimple}
          onToggleRural={() => setRuralMode((value) => !value)}
          onToggleExplain={() => setExplainSimple((value) => !value)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="panel animate-soft-in p-6">
            <div className="mb-5 space-y-3">
              {error && <StatusMessage type="error" title="Report analysis failed">{error}</StatusMessage>}
              {success && (
                <StatusMessage type={fallback ? "info" : "success"} title={fallback ? "Demo fallback active" : "Analysis complete"}>
                  {success}
                </StatusMessage>
              )}
            </div>

            <label className="flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-teal-200 bg-gradient-to-br from-mint/80 to-white p-8 text-center transition duration-200 hover:-translate-y-0.5 hover:border-aqua hover:shadow-soft">
              <span className="grid h-16 w-16 place-items-center rounded-lg bg-aqua text-white shadow-lg shadow-teal-100">
                <FileUp size={34} />
              </span>
              <span className="mt-6 text-2xl font-black">{file ? file.name : "Upload PDF or image report"}</span>
              <span className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Accepted formats: PDF, JPG, PNG. Maximum file size: 10 MB.
              </span>
              <input className="sr-only" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
            </label>

            {fileMeta && (
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold">{fileMeta.name}</p>
                <p className="mt-1 text-sm text-slate-500">{fileMeta.type} - {fileMeta.size}</p>
              </div>
            )}

            <button className="btn-primary mt-5 w-full" type="submit" disabled={!file || loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? "AI is analyzing your report..." : "Analyze medical report"}
            </button>

            <p className="mt-4 text-center text-xs font-semibold text-slate-500">
              AI insights are for informational purposes only. Please consult a licensed doctor.
            </p>
          </form>

          <ReportHistory history={history} />
        </div>

        <section className="min-w-0">
          {loading ? (
            <AnalysisLoader />
          ) : analysis ? (
            <AnalysisResult
              analysis={analysis}
              risk={risk}
              ruralMode={ruralMode}
              explainSimple={explainSimple}
              onDownload={downloadDoctorSummary}
            />
          ) : (
            <EmptyAnalysis />
          )}
        </section>
      </div>
    </>
  )
}

function normalizeAnalysis(raw, fileName) {
  return {
    ...mockAnalysis,
    ...raw,
    report_name: raw.report_name || fileName,
    key_findings: raw.key_findings || mockAnalysis.key_findings,
    abnormal_values: raw.abnormal_values || mockAnalysis.abnormal_values,
    normal_values: raw.normal_values || mockAnalysis.normal_values,
    possible_health_insights: raw.possible_health_insights || mockAnalysis.possible_health_insights,
    next_steps: raw.next_steps || mockAnalysis.next_steps,
    disclaimer: raw.disclaimer || mockAnalysis.disclaimer,
  }
}

function AnalysisResult({ analysis, risk, ruralMode, explainSimple, onDownload }) {
  const explanations = buildMedicalExplanations(analysis)

  return (
    <div className="animate-soft-in space-y-6">
      {risk && <RiskEngineCard risk={risk} ruralMode={ruralMode} explainSimple={explainSimple} />}

      <div className="panel overflow-hidden">
        <div className="bg-ink p-6 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-100">Detailed AI summary</p>
              <h2 className="mt-3 text-3xl font-black">{analysis.report_name}</h2>
              <p className={`${ruralMode ? "text-lg leading-8" : "leading-7"} mt-4 max-w-3xl text-slate-200`}>
                {explainSimple ? analysis.patient_friendly_explanation : analysis.summary}
              </p>
            </div>
            <PriorityBadge priority={analysis.doctor_visit_priority} />
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-3">
          <MiniInsight icon={Stethoscope} label="Suggested specialist" value={analysis.suggested_specialist} />
          <MiniInsight icon={AlertTriangle} label="Doctor visit priority" value={analysis.doctor_visit_priority} />
          <MiniInsight icon={FileHeart} label="Analyzed values" value={`${analysis.abnormal_values.length + analysis.normal_values.length} markers`} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightPanel title="Key Findings" icon={CheckCircle2} items={analysis.key_findings} />
        <InsightPanel title="Possible Health Insights" icon={Brain} items={analysis.possible_health_insights} />
      </div>

      <MetricSection title="Abnormal Values" description="Values outside the sample reference range." values={analysis.abnormal_values} />
      <MetricSection title="Normal Values" description="Values currently shown within the sample reference range." values={analysis.normal_values} />

      <section className="panel p-6">
        <h3 className="text-xl font-black">Patient-Friendly Medical Explanations</h3>
        <p className="mt-2 text-sm text-slate-500">Plain-language, multilingual-ready explanation blocks for common report terms.</p>
        <div className="mt-5">
          <MedicalExplanationList items={explanations} ruralMode={ruralMode} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="panel p-6">
          <h3 className="text-xl font-black">Patient-friendly explanation</h3>
          <p className={`${ruralMode ? "text-lg leading-8" : "leading-7"} mt-4 text-slate-700`}>
            {explainSimple ? "Your report has some numbers that need a doctor to check. It does not mean panic, but it means do not ignore it." : analysis.patient_friendly_explanation}
          </p>
          <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
            {analysis.disclaimer}
          </div>
        </section>

        <section className="panel p-6">
          <h3 className="text-xl font-black">Suggested next steps</h3>
          <ul className="mt-4 space-y-3">
            {analysis.next_steps.map((step) => (
              <li key={step} className="surface-hover rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                {step}
              </li>
            ))}
          </ul>
          <button type="button" onClick={onDownload} className="btn-primary mt-5 w-full">
            <Download size={18} />
            Download Doctor Summary
          </button>
        </section>
      </div>
    </div>
  )
}

function AnalysisLoader() {
  return (
    <div className="panel animate-soft-in overflow-hidden">
      <div className="bg-ink p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="relative grid h-14 w-14 place-items-center rounded-lg bg-aqua">
            <Brain className="animate-pulse" size={30} />
          </div>
          <div>
            <p className="text-sm font-bold text-teal-100">AI analysis in progress</p>
            <h2 className="mt-1 text-2xl font-black">Reading markers and building insights</h2>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-6">
        {["Extracting lab values", "Checking sample reference ranges", "Preparing doctor summary"].map((item, index) => (
          <div key={item} className="flex items-center gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-teal-800">{index + 1}</div>
            <div className="flex-1">
              <p className="font-bold">{item}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full animate-analysis rounded-full bg-aqua" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyAnalysis() {
  return (
    <div className="panel animate-soft-in grid min-h-[34rem] place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-lg bg-mint text-teal-800">
          <FileText size={34} />
        </span>
        <h2 className="mt-6 text-3xl font-black">Your intelligence report will appear here</h2>
        <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
          EasyMed will extract sample markers such as Hemoglobin, Glucose, Cholesterol, WBC Count, and Vitamin D, then organize them into doctor-ready insights.
        </p>
      </div>
    </div>
  )
}

function MetricSection({ title, description, values }) {
  return (
    <section className="panel p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-black">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{values.length} values</span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {values.map((value) => (
          <article key={value.name} className="surface-hover rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black">{value.name}</p>
                <p className="mt-1 text-sm text-slate-500">Reference: {value.reference_range}</p>
              </div>
              <StatusBadge status={value.status} />
            </div>
            <p className="mt-4 text-3xl font-black">
              {value.value} <span className="text-base font-bold text-slate-500">{value.unit}</span>
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{value.note}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function InsightPanel({ title, icon: Icon, items }) {
  return (
    <section className="panel p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-mint text-teal-800">
          <Icon size={22} />
        </span>
        <h3 className="text-xl font-black">{title}</h3>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

function ReportHistory({ history }) {
  return (
    <section className="panel animate-soft-in p-6">
      <h2 className="text-xl font-black">Report history</h2>
      <div className="mt-4 space-y-3">
        {history.map((item) => (
          <div key={item.id} className="surface-hover flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
            <div className="min-w-0">
              <p className="truncate font-bold">{item.name}</p>
              <p className="mt-1 text-sm text-slate-500">{item.date}{item.isMock ? " - Mock fallback" : ""}</p>
            </div>
            <PriorityBadge priority={item.priority} compact />
          </div>
        ))}
      </div>
    </section>
  )
}

function HeroStat({ icon: Icon, label, value }) {
  return (
    <div className="panel surface-hover animate-soft-in p-5">
      <Icon className="text-aqua" size={24} />
      <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  )
}

function MiniInsight({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <Icon className="text-aqua" size={22} />
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const classes = {
    Normal: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Low: "bg-amber-50 text-amber-800 border-amber-200",
    High: "bg-rose-50 text-rose-800 border-rose-200",
  }

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black ${classes[status] || classes.Normal}`}>
      {status}
    </span>
  )
}

function PriorityBadge({ priority, compact = false }) {
  const classes = {
    Low: "bg-emerald-100 text-emerald-900",
    Medium: "bg-amber-100 text-amber-900",
    High: "bg-rose-100 text-rose-900",
  }

  return (
    <span className={`inline-flex shrink-0 items-center rounded-full font-black ${classes[priority] || classes.Medium} ${compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"}`}>
      {compact ? priority : `Priority: ${priority}`}
    </span>
  )
}

function buildMedicalExplanations(analysis) {
  const explanations = {
    Hemoglobin: "Hemoglobin carries oxygen in your blood. If it is low, your body may need more iron or another medical review.",
    Glucose: "Glucose is sugar in your blood. If it is high, your body may be having trouble using sugar normally.",
    Cholesterol: "Cholesterol is a fat-like substance in blood. Too much can increase heart risk over time.",
    "WBC Count": "WBC Count shows infection-fighting cells. Very high or very low numbers may need a doctor review.",
    "Vitamin D": "Vitamin D helps bones and muscles. Low Vitamin D can happen with less sunlight or diet issues.",
  }

  return [...analysis.abnormal_values, ...analysis.normal_values].map((value) => ({
    term: value.name,
    simple: explanations[value.name] || `${value.name} is a report marker. Your doctor can explain what this value means for your health history.`,
  }))
}

function buildDoctorSummary(analysis) {
  const formatValues = (values) =>
    values
      .map((value) => `- ${value.name}: ${value.value} ${value.unit} (${value.status}; reference ${value.reference_range}) - ${value.note}`)
      .join("\n")

  return [
    "EasyMed Doctor Summary",
    `Report: ${analysis.report_name}`,
    `Generated: ${new Date(analysis.generated_at).toLocaleString()}`,
    "",
    "Summary:",
    analysis.summary,
    "",
    `Doctor Visit Priority: ${analysis.doctor_visit_priority}`,
    `Suggested Specialist: ${analysis.suggested_specialist}`,
    "",
    "Key Findings:",
    analysis.key_findings.map((item) => `- ${item}`).join("\n"),
    "",
    "Abnormal Values:",
    formatValues(analysis.abnormal_values),
    "",
    "Normal Values:",
    formatValues(analysis.normal_values),
    "",
    "Possible Health Insights:",
    analysis.possible_health_insights.map((item) => `- ${item}`).join("\n"),
    "",
    "Patient-Friendly Explanation:",
    analysis.patient_friendly_explanation,
    "",
    "Suggested Next Steps:",
    analysis.next_steps.map((item) => `- ${item}`).join("\n"),
    "",
    analysis.disclaimer,
  ].join("\n")
}
