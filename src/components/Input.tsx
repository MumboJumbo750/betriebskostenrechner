import { classNames } from '../lib/ui'

import type React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={classNames(
        'w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm backdrop-blur',
        'outline-none ring-0 focus:border-pink-300 focus:ring-4 focus:ring-pink-100',
        'disabled:bg-slate-50 disabled:text-slate-500',
        className,
      )}
      {...props}
    />
  )
}
