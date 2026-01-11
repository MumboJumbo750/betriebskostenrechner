import { classNames } from '../lib/ui'

import type React from 'react'

export function Label({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        'flex items-center gap-2 text-xs font-semibold text-slate-700',
        'before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-gradient-to-r before:from-pink-500 before:via-amber-300 before:to-sky-500 before:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
