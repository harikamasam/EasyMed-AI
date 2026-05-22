export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-aqua">{eyebrow}</p>}
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  )
}
