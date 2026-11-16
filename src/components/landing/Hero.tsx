import Link from 'next/link'
import { FaBullseye, FaChartLine, FaCircleCheck, FaWallet } from 'react-icons/fa6'

const bars = [32, 54, 43, 74, 58, 84, 66, 94, 72, 81, 60, 76]

export function Hero() {
  return (
    <section
      id="home"
      className="relative isolate mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 pt-10 sm:px-6 lg:grid-cols-2"
    >
      {/* Soft dotted background (decorative) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(var(--color-brand-100) 1.2px, transparent 1.2px)',
          backgroundSize: '22px 22px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent)',
        }}
      />

      <div className="animate-fade-up">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-brand-600" aria-hidden="true" />
          Campaigns and monetization in one workspace
        </span>

        <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
          A clearer way to{' '}
          <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
            plan and manage
          </span>{' '}
          digital advertising.
        </h1>

        <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
          RivinityADS brings advertiser campaign tools and publisher website workflows together in one calm,
          easy-to-navigate console.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Get started
          </Link>
          <Link
            href="/ad-formats"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-navy-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Explore ad formats
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          A frontend prototype with illustrative data. No live ad delivery or payments.
        </p>
      </div>

      <div className="relative animate-fade-up [animation-delay:120ms]">
        {/* Glow behind the preview (decorative) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-200 via-blue-100 to-indigo-200 opacity-70 blur-2xl"
        />

        <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur transition duration-300 ease-out hover:-translate-y-1 sm:p-6 lg:[transform:perspective(1200px)_rotateY(-6deg)_rotateX(2deg)] lg:hover:[transform:perspective(1200px)_rotateY(0deg)_rotateX(0deg)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Workspace preview</p>
              <h2 className="mt-1 text-lg font-semibold text-navy-900">Your campaign overview</h2>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">Mock preview</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-brand-100 hover:bg-white hover:shadow-md">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/20">
                <FaBullseye className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold text-navy-900">Campaigns</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">Organize goals, budgets, and delivery settings.</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-brand-100 hover:bg-white hover:shadow-md">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/20">
                <FaChartLine className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold text-navy-900">Reporting</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">Review sample performance in a single view.</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/20">
                  <FaWallet className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold text-navy-900">Budget controls</p>
              </div>
              <div className="mt-4 flex h-16 items-end gap-2" aria-label="Illustrative, non-live chart preview">
                {bars.map((height, index) => (
                  <span
                    key={index}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-brand-500 to-brand-100 transition-opacity duration-200 hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">Illustrative view · not live campaign data</p>
            </div>
          </div>
        </div>

        {/* Floating status chip (decorative, no numbers) */}
        <div className="absolute -bottom-4 left-4 hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-navy-900 shadow-lg sm:flex">
          <FaCircleCheck className="h-4 w-4 text-green-600" aria-hidden="true" />
          Website verified
        </div>
      </div>
    </section>
  )
}