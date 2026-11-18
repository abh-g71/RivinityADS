import Link from 'next/link'
import { ArrowRight, Eye, Megaphone, MousePointer2 } from 'lucide-react'

export function Hero() {
  return (
    <section className="mx-auto grid min-h-[72vh] max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-20">
      <div className="max-w-xl">
        <div className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Megaphone className="h-4 w-4 text-brand-600" aria-hidden="true" />
          RivinityADS advertising platform
        </div>
        <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
          Reach the right audience. Make every ad budget count.
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
          Plan and manage campaigns across digital channels with clear targeting, transparent spend, and performance you can track.
        </p>
        <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <span className="text-sm text-slate-500">Start with a campaign you control</span>
        </div>
        <p className="mt-4 text-xs text-slate-500">A product demo with sample data. No ads are delivered.</p>
      </div>

      <div aria-label="Sample advertising campaign dashboard" className="relative mx-auto w-full max-w-xl">
        <div className="absolute -inset-4 -z-10 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(to right, #2563eb 1px, transparent 1px), linear-gradient(to bottom, #2563eb 1px, transparent 1px)', backgroundSize: '24px 24px' }} aria-hidden="true" />
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Megaphone className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-slate-500">Campaign overview</p>
                <h2 className="mt-0.5 text-sm font-semibold text-navy-900">Spring collection</h2>
              </div>
            </div>
            <span className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600">Sample data</span>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4 sm:grid-cols-4">
              {[
                { label: 'Impressions', value: '48,260', Icon: Eye },
                { label: 'Clicks', value: '1,284', Icon: MousePointer2 },
                { label: 'CTR', value: '2.66%', Icon: MousePointer2 },
                { label: 'Spend', value: 'INR 3,240', Icon: Megaphone },
              ].map(({ label, value, Icon }) => (
                <div key={label}>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</div>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-navy-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-navy-900">Performance</h3>
                  <p className="mt-1 text-xs text-slate-500">Daily impressions · last 7 days</p>
                </div>
                <span className="text-xs text-slate-500">Sample data</span>
              </div>
              <svg viewBox="0 0 520 112" role="img" aria-label="Sample daily impressions chart for the last seven days" className="mt-3 h-28 w-full">
                <path d="M0 91H520M0 57H520M0 23H520" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                <path d="M4 83L89 71L174 76L259 48L344 56L429 29L516 17" fill="none" stroke="#2563eb" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                {[['4','83'],['89','71'],['174','76'],['259','48'],['344','56'],['429','29'],['516','17']].map(([cx, cy], index) => <circle key={index} cx={cx} cy={cy} r="3" fill="#2563eb" />)}
              </svg>
              <div className="flex justify-between text-[11px] text-slate-500"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[400px] text-left text-xs">
                <thead className="bg-slate-50 text-slate-500"><tr><th className="px-3 py-2 font-medium">Campaign</th><th className="px-3 py-2 font-medium">Status</th><th className="px-3 py-2 font-medium">Spend</th><th className="px-3 py-2 font-medium">Clicks</th></tr></thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr><td className="px-3 py-2.5 font-medium text-navy-900">Spring collection</td><td className="px-3 py-2.5">Active</td><td className="px-3 py-2.5">INR 3,240</td><td className="px-3 py-2.5">1,284</td></tr>
                  <tr><td className="px-3 py-2.5 font-medium text-navy-900">Weekend offers</td><td className="px-3 py-2.5">Paused</td><td className="px-3 py-2.5">INR 1,860</td><td className="px-3 py-2.5">742</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
