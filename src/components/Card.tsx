import { classNames } from '../lib/ui'

import type React from 'react'

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
          'rounded-2xl shadow-md',
          'theme-rainbow:rainbow-border',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames('border-b border-slate-100 px-5 py-4', className)}
      {...props}
    />
  )
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames('px-5 py-4', className)} {...props} />
}
