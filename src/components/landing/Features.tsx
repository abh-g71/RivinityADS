import { FaWallet, FaChartLine, FaBullseye } from 'react-icons/fa6'

const card = 'rounded-xl border border-slate-200/70 bg-white p-6 shadow-sm transition duration-200 ease-out hover:-translate-y-1 hover:shadow-md'
const iconTile = 'flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700'

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs text-slate-500">[KEY FEATURES]</p>
      <h2 className="mt-2 text-3xl font-bold text-navy-900">Everything in one console</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">A focused set of tools for planning advertiser campaigns and managing publisher placements. Previews and figures in this prototype are illustrative.</p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className={card}>
          <span className={iconTile}><FaBullseye className="h-4 w-4" aria-hidden="true" /></span>
          <h3 className="mt-4 font-semibold text-navy-900">Campaign planning</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">Shape campaign goals, budgets, audiences, and creative in a guided workspace.</p>
        </div>

        <div className={card}>
          <span className={iconTile}><FaChartLine className="h-4 w-4" aria-hidden="true" /></span>
          <h3 className="mt-4 font-semibold text-navy-900">Performance views</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">Review campaign and placement reporting through clear, scannable views.</p>
          <div className="mt-5 flex h-12 items-end gap-2" aria-hidden="true">
            {[35, 54, 44, 75, 58, 88, 68, 96].map((height, index) => (
              <span key={index} className="flex-1 rounded-t-sm bg-brand-100" style={{ height: `${height}%` }} />
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">Illustrative chart · mock data</p>
        </div>

        <div className={card}>
          <span className={iconTile}><FaWallet className="h-4 w-4" aria-hidden="true" /></span>
          <h3 className="mt-4 font-semibold text-navy-900">Budget visibility</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">Keep campaign budget controls and finance summaries close to your workflow.</p>
          <div className="mt-5 h-2 rounded-full bg-slate-100" aria-hidden="true">
            <div className="h-2 w-2/3 rounded-full bg-brand-600" />
          </div>
          <p className="mt-2 text-xs text-slate-500">Illustrative progress · mock data</p>
        </div>
      </div>
    </section>
  )
}