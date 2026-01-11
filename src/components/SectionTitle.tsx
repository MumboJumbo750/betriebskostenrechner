export function SectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-3">
      <div className="text-lg font-semibold theme-rainbow:text-transparent theme-rainbow:bg-clip-text theme-rainbow:bg-gradient-to-r theme-rainbow:from-fuchsia-600 theme-rainbow:via-amber-500 theme-rainbow:to-sky-600 theme-light:text-blue-900 theme-dark:text-blue-200">
        {title}
      </div>
      {subtitle ? <div className="text-sm text-slate-500">{subtitle}</div> : null}
    </div>
  )
}
