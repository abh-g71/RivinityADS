'use client'

import Link from 'next/link'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-brand-700">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-bold text-navy-900">We couldn’t load this page</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Try again, or return to the homepage. No changes were sent to a server.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]">Try again</button>
          <Link href="/" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-navy-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">Go to home</Link>
        </div>
      </div>
    </main>
  )
}
