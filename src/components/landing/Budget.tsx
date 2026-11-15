import Link from 'next/link'
import { FaWallet, FaSliders, FaChartLine } from 'react-icons/fa6'

const notes = [
  { title: 'Plan budgets.', Icon: FaWallet, text: 'Set a campaign budget that reflects your intended spend.' },
  { title: 'Adjust settings.', Icon: FaSliders, text: 'Review and update your campaign controls as your needs change.' },
  { title: 'Review reports.', Icon: FaChartLine, text: 'Use reporting views to understand the activity in your workspace.' },
]

export function Budget() {
  return (
    <section id="product" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-center font-mono text-xs text-slate-500">[BUDGETING FOR AD]</p>
      <h2 className="mt-2 text-center text-3xl font-bold text-navy-900">Manage your advertising budget with clarity</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-slate-600">Campaign setup, finance, and reporting are designed to live together. Explore the prototype without submitting a payment or delivering an ad.</p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-sm font-semibold text-navy-900">Budget overview</p>
            <p className="mt-1 text-xs text-slate-500">Example layout · values are not live</p>
          </div>
          <Link href="/login" className="text-sm font-semibold text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">View the console</Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {['Campaign budget', 'Spend summary', 'Finance activity'].map((label, index) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <div className="mt-4 h-2 rounded-full bg-slate-200">
                <div className={`h-2 rounded-full ${index === 1 ? 'bg-brand-500' : 'bg-brand-600'} ${index === 0 ? 'w-2/3' : index === 1 ? 'w-1/2' : 'w-3/4'}`} />
              </div>
              <p className="mt-3 text-xs text-slate-500">Sample view</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 text-left sm:grid-cols-3">
        {notes.map(({ title, Icon, text }) => (
          <div key={title}>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm"><b className="text-navy-900">{title}</b> <span className="text-slate-600">{text}</span></p>
          </div>
        ))}
      </div>
    </section>
  )
}