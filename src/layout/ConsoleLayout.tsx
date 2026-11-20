'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { TopBar } from './Topbar'
import type { ConsoleRole } from '@/data/navigation'
import { TooltipProvider } from '@/components/primitives/tooltip'
import { ToastProvider } from '@/components/shared/Toast'
import { ConsoleRoleProvider } from '@/components/shared/ConsoleRoleContext'
import { PageTransition } from '@/components/shared/PageTransition'

export function ConsoleLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const role: ConsoleRole =
    pathname.startsWith('/publisher')
      ? 'publisher'
      : pathname.startsWith('/admin')
        ? 'admin'
        : 'advertiser'

  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="flex min-h-screen bg-[var(--page)] lg:h-dvh lg:overflow-hidden">
          <Sidebar
            role={role}
            isOpen={menuOpen}
            isCollapsed={sidebarCollapsed}
            onClose={() => setMenuOpen(false)}
            onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
          />
          <div className="flex min-w-0 flex-1 flex-col lg:h-full lg:overflow-hidden">
            <TopBar
              role={role}
              onMenuClick={() => setMenuOpen(true)}
              onLogout={() => router.push('/login')}
            />
            <main className="console-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto p-3 lg:p-4">
              <ConsoleRoleProvider role={role}>
                <PageTransition pageKey={pathname}>{children}</PageTransition>
              </ConsoleRoleProvider>
            </main>
          </div>
        </div>
      </ToastProvider>
    </TooltipProvider>
  )
}
