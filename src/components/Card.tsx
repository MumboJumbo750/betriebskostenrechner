import { classNames } from '../lib/ui'

import type React from 'react'

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        'rainbow-border rounded-2xl shadow-md backdrop-blur',
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
