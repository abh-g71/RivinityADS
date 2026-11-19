import { useState } from 'react'
import { FiFileText, FiTag } from 'react-icons/fi'
import { formatPrice, getPathLabels, promotions } from '../../data/postAd'
import type { StepProps } from './types'

const tabs = [
  { id: 'cart', label: 'My Cart' },
  { id: 'delivery', label: 'Delivery and Invoice' },
  { id: 'payment', label: 'Payment' },
]

export function Step5Summary({ data }: StepProps) {
  const [tab, setTab] = useState('cart')
  const promo = promotions.find((p) => p.id === data.promotionId)
  const total = promo ? formatPrice(promo.price) : 'Free'
  const category = getPathLabels(data.path).join(' › ') || '—'

  return (
    <div>
      <h2 className="text-base font-semibold">Summary</h2>

      <div className="mt-4 inline-flex max-w-full overflow-x-auto rounded-full bg-slate-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {tab === 'cart' ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Promotion</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {promo ? (
                    <tr className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium">{promo.title}</td>
                      <td className="px-4 py-3 text-success-600">{formatPrice(promo.price)}</td>
                      <td className="px-4 py-3">1</td>
                      <td className="px-4 py-3 font-semibold text-success-600">{formatPrice(promo.price)}</td>
                    </tr>
                  ) : (
                    <tr className="border-t border-slate-100">
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                        No promotion selected. Your ad will be posted for free.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              This section will be connected to the real invoice and payment flow.
            </p>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50/60 p-5">
          <h3 className="text-sm font-semibold">Order summary</h3>

          <div className="mt-4 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FiFileText aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{data.title.trim() || 'Untitled ad'}</p>
              <p className="text-xs text-slate-500">{category}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FiTag aria-hidden />
            </span>
            <p className="text-sm">{promo ? promo.title : 'No promotion'}</p>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-sm text-slate-600">Total</span>
            <span className="text-xl font-bold text-brand-600">{total}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}