'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  FileText,
  Globe2,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  List,
  Mail,
  Megaphone,
  PanelTop,
  Plus,
  Receipt,
  Settings,
  ShieldCheck,
  Target,
  Users,
  Wallet,
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
  campaigns: List,
  'create-campaign': Plus,
  billing: Receipt,
  'admin-campaigns': FileCheck,
  'traffic-chart': BarChart3,
  'conversion-tracking': Target,
  'add-funds': Wallet,
  finance: Landmark,
  domains: Globe2,
  'post-ad': Megaphone,
  'email-marketing': Mail,
  notifications: Bell,
  'ad-tester': ShieldCheck,
  'system-health': Activity,
  reports: FileText,
  support: LifeBuoy,
  settings: Settings,
  'publisher-websites': Globe2,
  'publisher-placements': PanelTop,
  'publisher-statistics': BarChart3,
  'publisher-earnings': Wallet,
  'publisher-payments': Landmark,
  'admin-users': Users,
  'admin-advertisers': Megaphone,
  'admin-publishers': Users,
  'admin-websites': Globe2,
  'admin-support': LifeBuoy,
  'admin-settings': Settings,
  'admin-billing': Receipt,
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
  const groups = getNavGroups(role)

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col">
      <div className={`flex items-center ${isCollapsed ? 'flex-col gap-3' : 'justify-between gap-2'}`}>
        <Link
          href="/"
          onClick={onClose}
          aria-label="RivinityADS home"
          className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-semibold text-white">
            R
          </span>
          {!isCollapsed && <span className="truncate text-lg font-bold tracking-tight">RivinityADS</span>}
        </Link>
        {showCollapseControl && (
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
          </button>
        )}
      </div>

      <nav className="mt-6 flex flex-col gap-4" aria-label={`${role} navigation`}>
        {groups.map((group, index) => (
          <div key={group.title ?? index}>
            {group.title && (isCollapsed
              ? <div className="mx-3 mb-2 border-t border-border" aria-hidden="true" />
              : <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{group.title}</p>)}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => <li key={item.id}>{renderNavigationLink(item)}</li>)}
            </ul>
          </div>
        ))}
      </nav>

      {/* Account card (generic, no real user data) */}
      <div className="mt-auto pt-8">
        <div
          className={`flex items-center rounded-lg border border-border bg-muted ${
            isCollapsed ? 'justify-center p-2' : 'gap-3 p-3'
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <Users className="h-4 w-4" aria-hidden="true" />
          </span>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{roleLabel(role)} workspace</p>
              <p className="truncate text-xs text-muted-foreground">Simulated workspace</p>
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
        className={`group relative flex items-center rounded-md border-l-2 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
        } ${
          isActive
            ? 'border-transparent bg-primary font-medium text-primary-foreground'
            : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <Icon
          className="h-[18px] w-[18px] shrink-0"
          strokeWidth={1.5}
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
      <aside className={`fixed inset-y-0 left-0 z-30 hidden overflow-y-auto border-r border-border bg-sidebar px-3 py-6 text-sidebar-foreground transition-[width] duration-200 lg:block ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <NavigationContent
          role={role}
          onClose={onClose}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          showCollapseControl
        />
      </aside>
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
        <SheetContent side="left" className="w-64 overflow-y-auto border-r border-border bg-sidebar px-3 py-6 text-sidebar-foreground sm:max-w-64">
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
