import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

type EmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="px-6 py-12 text-center">
      <div className="relative mx-auto mb-6 h-28 w-28" aria-hidden="true">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-100 to-blue-50" />
        <svg viewBox="0 0 112 112" className="relative h-full w-full text-brand-600">
          <rect x="26" y="34" width="60" height="46" rx="8" fill="white" stroke="currentColor" strokeWidth="2.5" />
          <path d="M26 46h60" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="35" cy="40" r="2" fill="currentColor" />
          <circle cx="42" cy="40" r="2" fill="currentColor" opacity="0.5" />
          <rect x="36" y="56" width="22" height="4" rx="2" fill="currentColor" opacity="0.25" />
          <rect x="36" y="66" width="34" height="4" rx="2" fill="currentColor" opacity="0.15" />
          <circle cx="82" cy="30" r="11" fill="currentColor" />
          <path d="M82 25v10M77 30h10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </Card>
  )
}