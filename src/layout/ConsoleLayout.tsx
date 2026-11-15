'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { TopBar } from './Topbar'
import type { ConsoleRole } from '@/data/navigation'
import { TooltipProvider } from '@/components/primitives/tooltip'
import { ToastProvider } from '@/components/shared/Toast'

export function ConsoleLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<ConsoleRole>(() =>
    pathname.startsWith('/publisher') ? 'publisher' : 'advertiser',
  )

  function handleRoleChange(nextRole: ConsoleRole) {
    setRole(nextRole)
    router.push(nextRole === 'publisher' ? '/publisher' : '/dashboard')
  }

  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50">
          <Sidebar role={role} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
          <div className="lg:pl-64">
            <TopBar role={role} onRoleChange={handleRoleChange} onMenuClick={() => setMenuOpen(true)} />
            <main className="p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </ToastProvider>
    </TooltipProvider>
  )
}