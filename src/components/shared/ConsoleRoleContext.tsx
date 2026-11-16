'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { ConsoleRole } from '@/data/navigation'

const ConsoleRoleContext = createContext<ConsoleRole | null>(null)

export function ConsoleRoleProvider({ role, children }: { role: ConsoleRole; children: ReactNode }) {
  return <ConsoleRoleContext.Provider value={role}>{children}</ConsoleRoleContext.Provider>
}

export function useConsoleRole() {
  const role = useContext(ConsoleRoleContext)
  if (!role) throw new Error('useConsoleRole must be used within ConsoleRoleProvider.')
  return role
}
