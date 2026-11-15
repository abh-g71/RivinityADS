import Link from 'next/link'
import { Badge } from '../components/ui/Badge'
import { Button, ButtonLink } from '../components/ui/Button'
import { Select } from '@/components/ui/Select'
import type { ConsoleRole } from '@/data/navigation'

type TopBarProps = {
  role: ConsoleRole
  onRoleChange: (role: ConsoleRole) => void
  onMenuClick: () => void
}

export function TopBar({ role, onRoleChange, onMenuClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-6 md:h-16 md:flex-nowrap md:py-0">
      <Button
        variant="ghost"
        className="h-10 w-10 shrink-0 px-0"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        ☰
      </Button>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-500">
        {role === 'publisher' ? 'Publisher Console' : 'Advertiser Console'}
      </p>

      <div className="flex w-full min-w-0 items-center justify-between gap-2 md:w-auto md:shrink-0 md:justify-start md:gap-1 lg:gap-3">
        <div className="w-24 shrink-0 lg:w-36">
          <Select
            label="Role"
            labelClassName="sr-only"
            value={role}
            onChange={(event) =>
              onRoleChange(event.target.value === 'publisher' ? 'publisher' : 'advertiser')
            }
            options={[
              { value: 'advertiser', label: 'Advertiser' },
              { value: 'publisher', label: 'Publisher' },
            ]}
            className="h-9 px-2 text-xs sm:text-sm"
          />
        </div>
        {role === 'advertiser' && (
          <>
            <ButtonLink href="/campaigns/new" aria-label="Create Campaign" className="shrink-0 px-2 py-2 text-xs sm:px-3 sm:text-sm">
              <span className="lg:hidden">New</span>
              <span className="hidden lg:inline">Create Campaign</span>
            </ButtonLink>
            <Link
              href="/add-funds"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:px-3"
              aria-label="Mock balance ₹0.00. Add funds"
            >
              <span className="hidden lg:inline">₹0.00</span>
              <span aria-hidden="true">+</span>
            </Link>
          </>
        )}
        <span className="hidden text-sm font-semibold lg:inline">Abhi</span>
        <span className="hidden lg:inline-flex">
          <Badge tone="brand">{role.toUpperCase()}</Badge>
        </span>
        <Button variant="outline" className="shrink-0 px-2 py-1.5 text-xs lg:px-3 lg:text-sm">
          <span className="lg:hidden">Exit</span>
          <span className="hidden lg:inline">Log out</span>
        </Button>
      </div>
    </header>
  )
}