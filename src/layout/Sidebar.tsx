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
import { Button } from '@/components/ui/Button'
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
    <>
      <div className={`flex items-center ${isCollapsed ? 'flex-col gap-3' : 'justify-between gap-2'}`}>
        <Link
          href="/"
          onClick={onClose}
          aria-label="RivinityADS home"
          className="block min-w-0 rounded-sm px-3 text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {isCollapsed ? 'R' : 'RivinityADS'}
        </Link>
        {showCollapseControl && (
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 shrink-0 p-0 text-slate-200 hover:bg-navy-800 hover:text-white"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
          </Button>
        )}
      </div>
      <nav className="mt-8 flex flex-col gap-6" aria-label={`${role} navigation`}>
        {navGroups.map((group, index) => (
          <div key={group.title ?? index}>
            {group.title && !isCollapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {group.title}
              </p>
            )}
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.id}>{renderNavigationLink(item)}</li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </>
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
        className={`flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
          isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
        } ${
          isActive ? 'bg-brand-600 text-white' : 'text-slate-200 hover:bg-navy-800'
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
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
      <aside className={`fixed inset-y-0 left-0 z-30 hidden overflow-y-auto bg-navy-950 px-3 py-6 text-white transition-[width] duration-200 lg:block ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <NavigationContent
          role={role}
          onClose={onClose}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          showCollapseControl
        />
      </aside>
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
        <SheetContent side="left" className="w-64 border-r-0 bg-navy-950 px-3 py-6 text-white sm:max-w-64">
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
