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
      'theme-rainbow:bg-gradient-to-r theme-rainbow:from-pink-500 theme-rainbow:via-amber-300 theme-rainbow:to-sky-500 theme-rainbow:text-slate-900 theme-rainbow:shadow-sm theme-rainbow:hover:brightness-105 theme-rainbow:focus:ring-pink-200'
      + ' theme-light:bg-blue-600 theme-light:text-white theme-light:shadow-sm theme-light:hover:bg-blue-700 theme-light:focus:ring-blue-200'
      + ' theme-dark:bg-blue-700 theme-dark:text-white theme-dark:shadow-sm theme-dark:hover:bg-blue-800 theme-dark:focus:ring-blue-900',
    secondary:
      'theme-rainbow:bg-white/80 theme-rainbow:text-slate-900 theme-rainbow:border theme-rainbow:border-white/70 theme-rainbow:shadow-sm theme-rainbow:hover:bg-white theme-rainbow:focus:ring-sky-100'
      + ' theme-light:bg-white theme-light:text-blue-900 theme-light:border theme-light:border-slate-200 theme-light:shadow-sm theme-light:hover:bg-slate-100 theme-light:focus:ring-blue-100'
      + ' theme-dark:bg-[#232336] theme-dark:text-blue-100 theme-dark:border theme-dark:border-[#35354a] theme-dark:shadow-sm theme-dark:hover:bg-[#35354a] theme-dark:focus:ring-blue-900',
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
