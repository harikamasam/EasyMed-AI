import { AlertCircle, CheckCircle2, Info } from "lucide-react"

const variants = {
  error: {
    icon: AlertCircle,
    className: "border-rose-200 bg-rose-50 text-rose-900",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  info: {
    icon: Info,
    className: "border-sky-200 bg-sky-50 text-sky-900",
  },
}

export default function StatusMessage({ type = "info", title, children }) {
  const variant = variants[type] || variants.info
  const Icon = variant.icon

  return (
    <div className={`animate-soft-in rounded-lg border p-4 ${variant.className}`}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 shrink-0" size={20} />
        <div>
          {title && <p className="font-bold">{title}</p>}
          {children && <p className="mt-1 text-sm leading-6">{children}</p>}
        </div>
      </div>
    </div>
  )
}

export function LoadingBlock({ label = "Loading secure healthcare data..." }) {
  return (
    <div className="panel animate-soft-in p-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-mint" />
        <div className="min-w-0 flex-1">
          <div className="h-4 w-48 max-w-full animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-3 w-64 max-w-full animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  )
}
