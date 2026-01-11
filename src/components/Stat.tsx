import { classNames } from '../lib/ui'

export function Stat({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={classNames('rounded-xl border border-slate-200 bg-white px-4 py-3', className)}>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  )
}
