import { Activity, BellRing, CalendarDays, FileText, LayoutDashboard, LogOut, Menu, Stethoscope, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { clearSession, getCurrentUser } from "../api/auth.js"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/symptoms", label: "Symptoms", icon: Stethoscope },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/reminders", label: "Reminders", icon: BellRing },
]

export default function AppLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="page-shell lg:flex">
      <aside className="hidden min-h-screen w-72 border-r border-white/70 bg-white/75 px-6 py-6 shadow-soft backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-3 font-bold">
          <LogoMark />
          EasyMed
        </Link>
        <button className="rounded-lg border border-slate-200 p-2" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
      </header>

      <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="h-full w-80 max-w-[86vw] bg-white px-6 py-6 shadow-soft"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-3 font-bold" onClick={() => setOpen(false)}>
                <LogoMark />
                EasyMed
              </Link>
              <button className="rounded-lg border border-slate-200 p-2" onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate()
  const user = getCurrentUser()

  function handleLogout() {
    clearSession()
    onNavigate?.()
    navigate("/login", { replace: true })
  }

  return (
    <div className="flex h-full flex-col">
      <Link to="/dashboard" className="mb-9 flex items-center gap-3 text-xl font-bold" onClick={onNavigate}>
        <LogoMark />
        EasyMed
      </Link>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 font-semibold transition duration-200 ${
                isActive ? "bg-gradient-to-r from-mint to-white text-teal-800 shadow-sm" : "text-slate-600 hover:bg-white hover:text-ink hover:shadow-sm"
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-aqua to-teal-700 font-black text-white">
            {(user?.name || "P")[0]}
          </div>
          <div>
            <p className="text-sm font-bold">{user?.name || "Patient workspace"}</p>
            <p className="text-xs text-slate-500">Powered by AI</p>
          </div>
        </div>
        <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-aqua">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )
}

export function LogoMark() {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-lg bg-aqua text-white shadow-lg shadow-teal-200">
      <Activity size={22} strokeWidth={2.5} />
    </span>
  )
}
