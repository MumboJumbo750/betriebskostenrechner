import { classNames } from '../lib/ui'

import type React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={classNames(
        'w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm',
        'outline-none ring-0 focus:border-blue-400 focus:ring-4 focus:ring-blue-100',
        'disabled:bg-slate-50 disabled:text-slate-500',
        'theme-dark:bg-[#232336] theme-dark:text-blue-100',
        className,
      )}
      {...props}
    />
  )
}
