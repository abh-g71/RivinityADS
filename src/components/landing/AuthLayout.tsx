import type { ReactNode } from 'react'
import Link from 'next/link'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#7ECBF9]">
      <section className="flex min-h-screen flex-col px-4 py-6 sm:px-8">
        <div className="flex justify-end">
          <Link href="/" className="rounded-sm text-sm font-medium text-slate-900/80 hover:text-zinc-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950">Back to home</Link>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10">
          <div className="w-full max-w-[420px]">{children}</div>
          <div className="w-full max-w-[420px] text-center">
            <p className="text-sm font-semibold text-zinc-950">One workspace, two ways to grow</p>
            <h2 className="mt-2 text-xl font-semibold leading-tight tracking-tight text-zinc-950">Bring your advertising workflow into focus.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-900/80">Explore advertiser and publisher workspaces for campaign planning, placements, and performance reporting.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-slate-900/80">
              <span>Plan and review campaigns</span>
              <span>Manage publisher placements</span>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-slate-900/80">Authentication and displayed data are simulated; nothing is sent to a server.</p>
      </section>
    </main>
  )
}
