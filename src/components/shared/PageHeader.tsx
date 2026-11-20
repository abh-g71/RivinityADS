import type { ReactNode } from 'react'
import Link from 'next/link'

export type PageCrumb = { label: string; href?: string }

type PageHeaderProps = {
  breadcrumbs: PageCrumb[]
  title: string
  description: string
  action?: ReactNode
}

export function PageHeader({ breadcrumbs, title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-900/80">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="rounded-sm hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}>{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950">{title}</h1>
        <p className="min-w-0 truncate text-sm text-slate-900/80">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}
