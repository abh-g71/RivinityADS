import Link from 'next/link'
import { ArrowRight, Check, CircleHelp, MapPin, Wallet } from 'lucide-react'

export function Hero() {
  return (
    <section className="mx-auto grid min-h-[72vh] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:py-16">
      <div>
        <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
          Your next ad, made simple.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
          Create a clear campaign in a few guided steps, with your budget and audience easy to understand.
        </p>
        <Link href="/signup" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
          Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="mt-3 text-xs text-slate-500">A product demo with mock data. No ads are delivered.</p>
      </div>

      <div aria-label="Campaign setup preview" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-navy-900/5 sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-medium text-slate-500">NEW CAMPAIGN</p>
            <h2 className="mt-1 text-base font-semibold text-navy-900">A simple setup</h2>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">Step 2 of 4</span>
        </div>
        <div className="mt-5 flex gap-2" aria-label="Campaign progress">
          {[0, 1, 2, 3].map((step) => <span key={step} className={`h-1.5 flex-1 rounded-full ${step < 2 ? 'bg-brand-600' : 'bg-slate-100'}`} />)}
        </div>
        <div className="mt-5 rounded-xl border border-slate-200 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700"><MapPin className="h-4 w-4" aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-navy-900">Choose who to reach</p>
              <p className="mt-1 text-xs text-slate-500">Set a city, radius, and audience.</p>
              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <div className="h-20 rounded-lg bg-[radial-gradient(circle_at_35%_50%,#bfdbfe_0,#dbeafe_32%,#eff6ff_70%)]" aria-hidden="true" />
                <p className="mt-2 text-xs text-slate-600">Pick a location on the map</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-700"><Wallet className="h-4 w-4" aria-hidden="true" /></span><div><p className="text-xs text-slate-500">Daily budget</p><p className="text-sm font-semibold text-navy-900">Your choice</p></div></div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-700"><Check className="h-4 w-4" aria-hidden="true" /></span><div><p className="text-xs text-slate-500">Before publishing</p><p className="text-sm font-semibold text-navy-900">Review every detail</p></div></div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />Nothing is published without your approval.</div>
      </div>
    </section>
  )
}
