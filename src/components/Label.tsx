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
          'theme-rainbow:before:inline-block theme-rainbow:before:h-2 theme-rainbow:before:w-2 theme-rainbow:before:rounded-full theme-rainbow:before:bg-gradient-to-r theme-rainbow:before:from-pink-500 theme-rainbow:before:via-amber-300 theme-rainbow:before:to-sky-500 theme-rainbow:before:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
