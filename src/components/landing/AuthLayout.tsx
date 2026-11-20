import type { ReactNode } from 'react'
import Link from 'next/link'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <section className="flex min-h-screen flex-col px-4 py-6 sm:px-8">
        <div className="flex justify-end">
          <Link href="/" className="rounded-sm text-sm font-medium text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Back to home</Link>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10">
          <div className="w-full max-w-[420px]">{children}</div>
          <div className="w-full max-w-[420px] text-center">
            <p className="text-sm font-semibold text-foreground">One workspace, two ways to grow</p>
            <h2 className="mt-2 text-xl font-semibold leading-tight tracking-tight text-foreground">Bring your advertising workflow into focus.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Explore advertiser and publisher workspaces for campaign planning, placements, and performance reporting.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span>Plan and review campaigns</span>
              <span>Manage publisher placements</span>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">Authentication and displayed data are simulated; nothing is sent to a server.</p>
      </section>
    </main>
  )
}
