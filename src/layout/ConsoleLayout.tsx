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
  const [role, setRole] = useState<ConsoleRole>(() =>
    pathname.startsWith('/publisher')
      ? 'publisher'
      : pathname.startsWith('/admin')
        ? 'admin'
        : 'advertiser',
  )

  function handleRoleChange(nextRole: ConsoleRole) {
    setRole(nextRole)
    router.push(nextRole === 'publisher' ? '/publisher' : nextRole === 'admin' ? '/admin' : '/dashboard')
  }

  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50">
          <Sidebar
            role={role}
            isOpen={menuOpen}
            isCollapsed={sidebarCollapsed}
            onClose={() => setMenuOpen(false)}
            onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
          />
          <div className={sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}>
            <TopBar
              role={role}
              onRoleChange={handleRoleChange}
              onMenuClick={() => setMenuOpen(true)}
              onLogout={() => router.push('/login')}
            />
            <main className="p-4 sm:p-6 lg:p-8">
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