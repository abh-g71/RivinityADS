'use client'

import { useState } from 'react'
import Link from 'next/link'
import { demoPricingPlans } from '@/data/landing'

export function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-center font-mono text-xs text-slate-500">[PRICING]</p>
      <h2 className="mt-2 text-center text-3xl font-bold text-navy-900">A simple way to explore the product</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-slate-600">Pricing below is illustrative mock content for this frontend prototype, not an offer or live platform pricing.</p>
      <div className="mx-auto mt-6 flex w-fit rounded-lg border border-slate-200 bg-white p-1 text-sm" role="group" aria-label="Illustrative billing period">
        {['Monthly', 'Annual'].map((label) => (
          <button
            key={label}
            type="button"
            aria-pressed={(label === 'Annual') === annual}
            onClick={() => setAnnual(label === 'Annual')}
            className={`rounded-md px-4 py-1.5 font-medium transition-colors ${(label === 'Annual') === annual ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {demoPricingPlans.map((plan) => (
          <div key={plan.name} className={`rounded-lg border border-slate-200 bg-white p-6 ${plan.featured ? 'border-brand-600' : ''}`}>
            <p className="text-sm font-medium text-slate-500">{plan.name} · demo</p>
            <p className="mt-2 text-3xl font-bold text-navy-900">
              {plan.monthly === null ? 'Custom' : `₹${(annual ? Math.round(plan.monthly * 0.8) : plan.monthly).toLocaleString('en-IN')}`}
              {plan.monthly !== null && <span className="text-sm font-normal text-slate-500"> /month</span>}
            </p>
            <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
            <Link href="/signup" className={`mt-5 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${plan.featured ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border border-slate-200 text-navy-900 hover:bg-slate-50'}`}>
              {plan.action}
            </Link>
            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              {plan.features.map((feature) => <li key={feature}><span className="mr-2 text-brand-700" aria-hidden="true">✓</span>{feature}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
