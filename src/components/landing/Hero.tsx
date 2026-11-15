import Link from 'next/link'
import { FaChartLine, FaBullseye, FaWallet } from 'react-icons/fa6'

export function Hero() {
  return (
    <section id="home" className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-2">
      <div className="animate-fade-up">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-brand-600" aria-hidden="true" />
          Campaigns and monetization in one workspace
        </span>
        <h1 className="mt-5 max-w-xl text-4xl font-bold leading-tight tracking-tight text-navy-900 sm:text-5xl">
          A clearer way to plan and manage digital advertising.
        </h1>
        <p className="mt-4 max-w-lg leading-7 text-slate-600">
          RivinityADS brings advertiser campaign tools and publisher website workflows together in one calm, easy-to-navigate console.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]">
            Get started
          </Link>
          <Link href="/ad-formats" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-navy-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]">
            Explore ad formats
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">A frontend prototype with illustrative data. No live ad delivery or payments.</p>
      </div>

      <div className="animate-fade-up [animation-delay:120ms]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl transition duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl sm:p-6 lg:[transform:perspective(1200px)_rotateY(-6deg)_rotateX(2deg)] lg:hover:[transform:perspective(1200px)_rotateY(0deg)_rotateX(0deg)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Workspace preview</p>
              <h2 className="mt-1 text-lg font-semibold text-navy-900">Your campaign overview</h2>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">Mock preview</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <FaBullseye className="h-4 w-4 text-brand-600" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-navy-900">Campaigns</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">Organize goals, budgets, and delivery settings.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <FaChartLine className="h-4 w-4 text-brand-600" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-navy-900">Reporting</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">Review sample performance in a single view.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
              <div className="flex items-center gap-3">
                <FaWallet className="h-4 w-4 text-brand-600" aria-hidden="true" />
                <p className="text-sm font-semibold text-navy-900">Budget controls</p>
              </div>
              <div className="mt-4 flex h-12 items-end gap-2" aria-label="Illustrative, non-live chart preview">
                {[32, 54, 43, 74, 58, 84, 66, 94, 72, 81, 60, 76].map((height, index) => (
                  <span key={index} className="flex-1 rounded-t-sm bg-brand-100 transition-colors duration-200 hover:bg-brand-500" style={{ height: `${height}%` }} />
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">Illustrative view · not live campaign data</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}