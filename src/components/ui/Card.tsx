import type { HTMLAttributes } from 'react'

export function Card({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-black/10 bg-white ${className}`}
      {...props}
    />
  )
}
