'use client'
import { useState } from 'react'
import { CheckCircle2, Image, MapPin, Phone, User } from 'lucide-react'
import { getPathLabels } from '../../data/postAd'
import type { StepProps } from './types'

const tones = ['bg-muted', 'bg-border', 'bg-muted', 'bg-border']

export function Step3Preview({ data }: StepProps) {
  const [active, setActive] = useState(0)

  const symbol = data.currency === 'usd' ? '$' : '₹'
  const priceNum = Number(data.price)
  const price = priceNum > 0 ? `${symbol}${priceNum.toLocaleString(data.currency === 'usd' ? 'en-US' : 'en-IN')}` : '—'
  const labels = getPathLabels(data.path)
  const category = labels.length ? labels.join(' › ') : '—'

  const specs = [
    ['Category', category],
    ['Price', price],
    ['Currency', data.currency.toUpperCase()],
    ['Condition', 'Used – good'],
    ['Posted', 'Just now'],
  ]

  return (
    <div>
      <h2 className="text-base font-semibold">Preview</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Check your ad. Click Continue if everything looks right, or Back to edit.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className={`flex aspect-video items-center justify-center rounded-lg ${tones[active]}`}>
            <Image className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {tones.map((tone, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Photo ${i + 1}`}
                className={`aspect-video rounded-lg ${tone} ring-offset-2 ${
                  active === i ? 'ring-2 ring-ring' : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>

          <h3 className="mt-5 text-xl font-semibold">{data.title.trim() || 'Untitled ad'}</h3>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
            {data.description.trim() || 'No description added.'}
          </p>

          <table className="mt-5 w-full overflow-hidden rounded-lg border border-border text-sm">
            <tbody>
              {specs.map(([label, value]) => (
                <tr key={label} className="border-b border-border last:border-0">
                  <th scope="row" className="w-1/3 bg-secondary px-4 py-2.5 text-left font-medium text-muted-foreground">
                    {label}
                  </th>
                  <td className="px-4 py-2.5">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="h-fit rounded-lg border border-border p-5">
          <p className="text-2xl font-bold text-foreground">{price}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-4 w-4" aria-hidden="true" /> Your city
          </p>

          <div className="mt-5 flex items-center gap-3 border-t border-border pt-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">Seller name</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Verified seller
              </p>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white"
          >
            <Phone className="h-4 w-4" aria-hidden="true" /> Show phone number
          </button>
        </aside>
      </div>
    </div>
  )
}
