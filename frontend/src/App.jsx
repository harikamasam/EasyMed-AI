import { Navigate, Route, Routes } from "react-router-dom"
import AppLayout from "./components/AppLayout.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import AppointmentBooking from "./pages/AppointmentBooking.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Landing from "./pages/Landing.jsx"
import Login from "./pages/Login.jsx"
import ReportUpload from "./pages/ReportUpload.jsx"
import Reminders from "./pages/Reminders.jsx"
import Signup from "./pages/Signup.jsx"
import SymptomChecker from "./pages/SymptomChecker.jsx"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<ReportUpload />} />
          <Route path="/symptoms" element={<SymptomChecker />} />
          <Route path="/appointments" element={<AppointmentBooking />} />
          <Route path="/reminders" element={<Reminders />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
