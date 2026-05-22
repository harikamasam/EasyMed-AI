import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { saveSession } from "../api/auth.js"
import { api, getApiErrorMessage, isBackendUnavailable } from "../api/client.js"
import { LogoMark } from "../components/AppLayout.jsx"
import StatusMessage from "../components/StatusMessage.jsx"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    const form = new FormData(event.currentTarget)
    try {
      const response = await api.post("/api/auth/login", Object.fromEntries(form))
      saveSession(response.data)
      setSuccess("Login successful. Opening your patient dashboard...")
      setTimeout(() => navigate(location.state?.from || "/dashboard", { replace: true }), 350)
    } catch (err) {
      if (isBackendUnavailable(err)) {
        saveSession({
          token: "mock-token-backend-unavailable",
          user: { id: "mock-user", name: "Demo Patient", email: form.get("email"), role: "patient" },
        })
        setSuccess("Backend unavailable, so EasyMed opened a mock patient session for local demo mode.")
        setTimeout(() => navigate(location.state?.from || "/dashboard", { replace: true }), 500)
      } else {
        setError(getApiErrorMessage(err, "Login failed. Please check your credentials."))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame title="Welcome back" subtitle="Log in to continue your AI-powered care journey.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <StatusMessage type="error" title="Login failed">{error}</StatusMessage>}
        {success && <StatusMessage type="success" title="Authenticated">{success}</StatusMessage>}
        <div>
          <label className="label">Email</label>
          <input className="field mt-2" name="email" type="email" defaultValue="patient@easymed.ai" required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="field mt-2" name="password" type="password" defaultValue="password123" required />
        </div>
        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading && <Loader2 className="animate-spin" size={20} />}
          {loading ? "Signing in..." : "Login"}
        </button>
        <p className="text-center text-sm text-slate-500">
          New to EasyMed? <Link to="/signup" className="font-bold text-aqua">Create account</Link>
        </p>
      </form>
    </AuthFrame>
  )
}

export function AuthFrame({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen bg-cloud lg:grid-cols-[1fr_0.95fr]">
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-3 text-xl font-bold">
            <LogoMark />
            EasyMed
          </Link>
          <div className="panel animate-soft-in p-6 sm:p-8">
            <h1 className="text-3xl font-black">{title}</h1>
            <p className="mt-2 text-slate-600">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
      <div className="hidden bg-ink p-10 text-white lg:flex lg:items-end">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-teal-100">Patient intelligence layer</p>
          <h2 className="max-w-xl text-5xl font-black leading-tight">Reports, symptoms, and appointments working together.</h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">Dummy AI today, production-ready integration points tomorrow.</p>
        </div>
      </div>
    </div>
  )
}
