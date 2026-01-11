export function SectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-3">
      <div className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-amber-500 to-sky-600">
        {title}
      </div>
      {subtitle ? <div className="text-sm text-slate-500">{subtitle}</div> : null}
    </div>
  )
}
