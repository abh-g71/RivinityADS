import Link from 'next/link'

export function Integrations() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
      <p className="font-mono text-xs text-slate-500">[ONE WORKSPACE]</p>
      <h2 className="mt-2 text-3xl font-bold text-navy-900">Built for both sides of the ad network</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        Advertisers can explore campaign workflows while publishers can review website and placement tools. The prototype uses mock data and does not connect to external ad platforms.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/advertisers" className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">For advertisers</Link>
        <Link href="/publishers" className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">For publishers</Link>
      </div>
    </section>
  )
}