import type { ReactNode } from 'react'
import Link from 'next/link'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-navy-950 px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3 rounded-sm text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">R</span>
            RivinityADS
          </Link>
        </div>
        <div className="relative max-w-lg py-12">
          <p className="text-sm font-semibold text-brand-100">One workspace, two ways to grow</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight">Bring your advertising workflow into focus.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">Explore mock advertiser and publisher panels in this frontend prototype. No account, payment, ad delivery, or tracking data is sent to a server.</p>
          <div className="mt-8 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-navy-900/70 p-4">Plan and review campaigns</div>
            <div className="rounded-xl border border-slate-700 bg-navy-900/70 p-4">Manage publisher placements</div>
          </div>
        </div>
        <p className="relative text-xs text-slate-400">RivinityADS · Interactive demo</p>
      </aside>

      <section className="flex min-h-screen flex-col px-4 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="inline-flex items-center gap-2 rounded-sm font-bold text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white">R</span>
            RivinityADS
          </Link>
          <Link href="/" className="rounded-sm text-sm font-medium text-slate-600 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Back to home</Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="text-center text-xs text-slate-500">Demo experience · No personal data is submitted</p>
      </section>
    </main>
  )
}
