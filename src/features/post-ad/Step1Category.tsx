import { Building2, CheckCircle2, ChevronRight, House, LandPlot, Umbrella, Waypoints, type LucideIcon } from 'lucide-react'
import { getColumns, getPathLabels, isCategoryComplete } from '../../data/postAd'
import type { StepProps } from './types'

const icons: Record<string, LucideIcon> = {
  house: House,
  office: Building2,
  tourist: Umbrella,
  land: LandPlot,
  projects: Waypoints,
}

const levelTitles = ['Category', 'Listing type', 'Property type']

export function Step1Category({ data, update }: StepProps) {
  const columns = getColumns(data.path)
  const done = isCategoryComplete(data.path)
  const labels = getPathLabels(data.path)

  return (
    <div>
      <h2 className="text-base font-semibold">Select category step by step</h2>
      <p className="mt-1 text-sm text-slate-500">Choose a category, then narrow it down.</p>

      {/* Selection path */}
      <div className="mt-4 flex min-h-9 flex-wrap items-center gap-2 text-sm">
        {labels.length === 0 ? (
          <span className="text-slate-400">Nothing selected yet</span>
        ) : (
          labels.map((label, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
              <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700">{label}</span>
            </span>
          ))
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((nodes, level) => (
          <div key={level}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              {levelTitles[level]}
            </p>
            <ul className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2">
              {nodes.map((node) => {
                const selected = data.path[level] === node.id
                const Icon = level === 0 ? icons[node.id] : undefined
                return (
                  <li key={node.id}>
                    <button
                      type="button"
                      onClick={() => update({ path: [...data.path.slice(0, level), node.id] })}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        selected
                          ? 'bg-navy-900 text-white'
                          : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {Icon && <Icon className="h-4 w-4 opacity-80" />}
                        {node.label}
                      </span>
                      {node.children && <ChevronRight className="h-3 w-3 opacity-60" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {done && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-slate-600" />
            <p className="mt-3 text-sm font-semibold">Category selection has been completed.</p>
          </div>
        )}
      </div>
    </div>
  )
}
