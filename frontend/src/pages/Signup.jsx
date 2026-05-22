import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { saveSession } from "../api/auth.js"
import { api, getApiErrorMessage, isBackendUnavailable } from "../api/client.js"
import StatusMessage from "../components/StatusMessage.jsx"
import { AuthFrame } from "./Login.jsx"

export default function Signup() {
  const navigate = useNavigate()
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
      const response = await api.post("/api/auth/signup", Object.fromEntries(form))
      saveSession(response.data)
      setSuccess("Account created. Preparing your EasyMed workspace...")
      setTimeout(() => navigate("/dashboard", { replace: true }), 350)
    } catch (err) {
      if (isBackendUnavailable(err)) {
        saveSession({
          token: "mock-token-backend-unavailable",
          user: { id: "mock-user", name: form.get("name"), email: form.get("email"), role: "patient" },
        })
        setSuccess("Backend unavailable, so EasyMed created a mock patient session for local demo mode.")
        setTimeout(() => navigate("/dashboard", { replace: true }), 500)
      } else {
        setError(getApiErrorMessage(err, "Signup failed. Please review your details."))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame title="Create your patient profile" subtitle="Set up a secure demo account and start organizing your health data.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <StatusMessage type="error" title="Signup failed">{error}</StatusMessage>}
        {success && <StatusMessage type="success" title="Account ready">{success}</StatusMessage>}
        <div>
          <label className="label">Full name</label>
          <input className="field mt-2" name="name" defaultValue="Aarav Sharma" required />
        </div>
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
          {loading ? "Creating account..." : "Create account"}
        </button>
        <p className="text-center text-sm text-slate-500">
          Already registered? <Link to="/login" className="font-bold text-aqua">Login</Link>
        </p>
      </form>
    </AuthFrame>
  )
}
