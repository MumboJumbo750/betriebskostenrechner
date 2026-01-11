import { classNames } from '../lib/ui'

import type React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-4'

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
  } as const

  const variants = {
    primary:
      'bg-gradient-to-r from-pink-500 via-amber-300 to-sky-500 text-slate-900 shadow-sm hover:brightness-105 focus:ring-pink-200',
    secondary:
      'bg-white/80 text-slate-900 border border-white/70 shadow-sm hover:bg-white focus:ring-sky-100',
    danger:
      'bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-100',
  } as const

  return (
    <button
      className={classNames(base, sizes[size], variants[variant], className)}
      {...props}
    />
  )
}
