import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  Megaphone,
  MousePointer2,
} from 'lucide-react'

export function Hero() {
  return (
    <section className="mx-auto grid min-h-[72vh] max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-20">
      <div className="max-w-xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-brand-700">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          ADVERTISING, MADE CLEAR
        </div>
        <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
          Reach the right audience. Make every ad budget count.
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
          Plan and manage campaigns across digital channels with clear targeting, transparent spend, and performance you can track.
        </p>
        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
          <Link
            href="/signup"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <span className="text-sm text-slate-500">Start with a campaign you control</span>
        </div>
        <p className="mt-4 text-xs text-slate-500">A product demo with mock data. No ads are delivered.</p>
      </div>

      <div aria-label="Sample advertising campaign performance dashboard" className="relative mx-auto w-full max-w-xl">
        <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand-50/80 sm:-inset-6" aria-hidden="true" />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-navy-900/10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Megaphone className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-medium text-slate-500">SAMPLE CAMPAIGN</p>
                <h2 className="mt-0.5 text-sm font-semibold text-navy-900">Spring collection</h2>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden="true" />
              Preview
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Eye className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  Estimated reach
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">24.8k</p>
                <p className="mt-1 text-xs text-slate-500">people in your audience</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <MousePointer2 className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  Daily budget
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">$45</p>
                <p className="mt-1 text-xs text-slate-500">set by you</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-navy-900">Projected impressions</p>
                  <p className="mt-1 text-xs text-slate-500">Campaign forecast · next 7 days</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-800">
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  Forecast
                </span>
              </div>
              <div className="mt-5 h-28 w-full" aria-hidden="true">
                <svg viewBox="0 0 520 112" preserveAspectRatio="none" className="h-full w-full">
                  <path d="M0 91H520M0 57H520M0 23H520" fill="none" stroke="#e2e8f0" strokeDasharray="4 5" />
                  <path d="M4 91C36 87 49 76 78 80S121 65 151 70 195 46 224 55 267 43 297 48 338 29 371 37 416 20 443 27 487 11 516 15V112H4Z" fill="#eff6ff" />
                  <path d="M4 91C36 87 49 76 78 80S121 65 151 70 195 46 224 55 267 43 297 48 338 29 371 37 416 20 443 27 487 11 516 15" fill="none" stroke="#2563eb" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                  <circle cx="516" cy="15" r="4.5" fill="#2563eb" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-4 py-3 text-xs">
              <span className="text-slate-600">Your budget stays in your hands</span>
              <span className="font-medium text-navy-900">Review before launch</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
