import type { ReactNode } from 'react'
import { Footer } from '@/components/landing/Footer'
import { Navbar } from '@/components/landing/Navbar'

export function PublicPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
