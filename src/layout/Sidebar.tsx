'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getNavGroups, type ConsoleRole } from '@/data/navigation'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/primitives/sheet'

type SidebarProps = { role: ConsoleRole; isOpen: boolean; onClose: () => void }

function NavigationContent({ role, onClose }: Pick<SidebarProps, 'role' | 'onClose'>) {
  const pathname = usePathname()
  const navGroups = getNavGroups(role)

  return (
    <>
      <Link href="/" onClick={onClose} className="block rounded-sm px-3 text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
        RivinityADS
      </Link>
      <nav className="mt-8 flex flex-col gap-6">
        {navGroups.map((group, index) => (
          <div key={group.title ?? index}>
            {group.title && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {group.title}
              </p>
            )}
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      pathname === item.href ? 'bg-brand-600 text-white' : 'text-slate-200 hover:bg-navy-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </>
  )
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto bg-navy-950 px-3 py-6 text-white lg:block">
        <NavigationContent role={role} onClose={onClose} />
      </aside>
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
        <SheetContent side="left" className="w-64 border-r-0 bg-navy-950 px-3 py-6 text-white sm:max-w-64">
          <SheetTitle className="sr-only">Console navigation</SheetTitle>
          <NavigationContent role={role} onClose={onClose} />
        </SheetContent>
      </Sheet>
    </>
  )
}
