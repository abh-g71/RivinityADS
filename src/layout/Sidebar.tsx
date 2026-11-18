'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  FileCheck,
  FileText,
  Globe2,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Megaphone,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { getNavGroups, type ConsoleRole, type NavItem } from '@/data/navigation'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/primitives/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/primitives/tooltip'

type SidebarProps = {
  role: ConsoleRole
  isOpen: boolean
  isCollapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

const navIcons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  'publisher-dashboard': LayoutDashboard,
  'admin-dashboard': LayoutDashboard,
  campaigns: Megaphone,
  'create-campaign': Megaphone,
  billing: CircleDollarSign,
  'admin-campaigns': FileCheck,
  'traffic-chart': BarChart3,
  'conversion-tracking': Activity,
  'add-funds': CircleDollarSign,
  finance: CreditCard,
  domains: Globe2,
  'post-ad': FileText,
  'email-marketing': Mail,
  notifications: Bell,
  'ad-tester': ShieldCheck,
  'system-health': Activity,
  reports: BarChart3,
  support: LifeBuoy,
  settings: Settings,
  'publisher-websites': Globe2,
  'publisher-placements': FileText,
  'publisher-statistics': BarChart3,
  'publisher-earnings': CircleDollarSign,
  'publisher-payments': CreditCard,
  'admin-users': Users,
  'admin-advertisers': Megaphone,
  'admin-publishers': Users,
  'admin-websites': Globe2,
  'admin-support': LifeBuoy,
  'admin-settings': Settings,
  'admin-billing': CreditCard,
}

function roleLabel(role: ConsoleRole) {
  const text = String(role)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function NavigationContent({
  role,
  onClose,
  isCollapsed,
  onToggleCollapse,
  showCollapseControl,
}: Pick<SidebarProps, 'role' | 'onClose' | 'isCollapsed' | 'onToggleCollapse'> & {
  showCollapseControl: boolean
}) {
  const pathname = usePathname()
  const navGroups = getNavGroups(role)

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col">
      <div className={`flex items-center ${isCollapsed ? 'flex-col gap-3' : 'justify-between gap-2'}`}>
        <Link
          href="/"
          onClick={onClose}
          aria-label="RivinityADS home"
          className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-base font-bold text-white shadow-lg shadow-brand-600/30">
            R
          </span>
          {!isCollapsed && <span className="truncate text-lg font-bold tracking-tight">RivinityADS</span>}
        </Link>
        {showCollapseControl && (
                    <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
          </button>
        )}
      </div>

      <nav className="mt-8 flex flex-col gap-6" aria-label={`${role} navigation`}>
        {navGroups.map((group, index) => (
          <div key={group.title ?? index}>
            {group.title && !isCollapsed ? (
              <details open={group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))} className="group/tools">
                <summary className="mb-2 flex min-h-9 cursor-pointer list-none items-center justify-between rounded-lg px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  {group.title}
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-open/tools:rotate-90" aria-hidden="true" />
                </summary>
                <ul className="flex flex-col gap-1">
                  {group.items.map((item) => <li key={item.id}>{renderNavigationLink(item)}</li>)}
                </ul>
              </details>
            ) : (
              <>
                {group.title && isCollapsed && <p className="sr-only">{group.title}</p>}
                <ul className="flex flex-col gap-1">
                  {group.items.map((item) => <li key={item.id}>{renderNavigationLink(item)}</li>)}
                </ul>
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Account card (generic, no real user data) */}
      <div className="mt-auto pt-8">
        <div
          className={`flex items-center rounded-xl border border-white/10 bg-white/5 ${
            isCollapsed ? 'justify-center p-2' : 'gap-3 p-3'
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <Users className="h-4 w-4" aria-hidden="true" />
          </span>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{roleLabel(role)} workspace</p>
              <p className="truncate text-xs text-slate-400">Simulated workspace</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  function renderNavigationLink(item: NavItem) {
    const Icon = navIcons[item.id] ?? LayoutDashboard
    const rootRoutes = ['/campaigns', '/admin', '/publisher', '/dashboard']
    const isActive = pathname === item.href || (
      !rootRoutes.includes(item.href) && pathname.startsWith(`${item.href}/`)
    )
    const link = (
      <Link
        href={item.href}
        onClick={onClose}
        aria-current={isActive ? 'page' : undefined}
        className={`group relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
          isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
        } ${
          isActive
            ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        {isActive && (
          <span aria-hidden="true" className="absolute -left-3 bottom-2 top-2 w-1 rounded-r-full bg-white" />
        )}
        <Icon
          className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'drop-shadow' : ''}`}
          aria-hidden="true"
        />
        <span className={isCollapsed ? 'sr-only' : 'min-w-0 truncate'}>{item.label}</span>
      </Link>
    )

    if (!isCollapsed) return link

    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }
}

export function Sidebar({
  role,
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-30 hidden overflow-y-auto bg-gradient-to-b from-navy-950 to-navy-900 px-3 py-6 text-white transition-[width] duration-200 lg:block ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <NavigationContent
          role={role}
          onClose={onClose}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          showCollapseControl
        />
      </aside>
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
        <SheetContent side="left" className="w-64 overflow-y-auto border-r-0 bg-gradient-to-b from-navy-950 to-navy-900 px-3 py-6 text-white sm:max-w-64">
          <SheetTitle className="sr-only">Console navigation</SheetTitle>
          <NavigationContent
            role={role}
            onClose={onClose}
            isCollapsed={false}
            onToggleCollapse={onToggleCollapse}
            showCollapseControl={false}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
