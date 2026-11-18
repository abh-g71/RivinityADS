import { Check } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { formatPrice, promotions } from '../../data/postAd'
import type { PostAdData } from './types'

export function SuccessScreen({ data, onRestart }: { data: PostAdData; onRestart: () => void }) {
  const promo = promotions.find((p) => p.id === data.promotionId)

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-center text-navy-900">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Check className="h-5 w-5" aria-hidden="true" />
      </div>

      <h2 className="mt-5 text-xl font-semibold">Your ad has been submitted</h2>
      <p className="mt-2 text-sm text-slate-600">It will go live after review.</p>

      <dl className="mx-auto mt-6 max-w-xs rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Ad</dt>
          <dd className="truncate font-medium">{data.title.trim() || 'Untitled ad'}</dd>
        </div>
        <div className="mt-2 flex justify-between gap-4">
          <dt className="text-slate-500">Promotion</dt>
          <dd className="font-medium">{promo ? `${promo.title} · ${formatPrice(promo.price)}` : 'None'}</dd>
        </div>
      </dl>

      <Button className="mt-6" onClick={onRestart}>Post another ad</Button>
    </div>
  )
}
