import { Badge } from '../../components/ui/Badge'
import { Checkbox } from '../../components/ui/Checkbox'
import { formatPrice, promotions } from '../../data/postAd'
import type { StepProps } from './types'

export function Step4Promotion({ data, update }: StepProps) {
  return (
    <div>
      <h2 className="text-base font-semibold">Promote your ad</h2>
      <p className="mt-1 text-sm text-muted-foreground">Add power to your ad by selecting a promotion.</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {promotions.map((p) => {
          const selected = data.promotionId === p.id
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={selected}
              onClick={() => update({ promotionId: p.id, skipPromo: false })}
              className={`rounded-lg border-2 p-3 text-left transition-colors ${
                selected ? 'border-primary bg-secondary' : 'border-border bg-white hover:border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase">{p.title}</h3>
                <Badge tone={selected ? 'brand' : 'neutral'}>{selected ? 'Selected' : 'Select'}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-3 text-sm font-semibold text-success-600">
                {p.days} days for {formatPrice(p.price)}
              </p>
            </button>
          )
        })}
      </div>

      <div className="mt-5">
        <Checkbox
          label="I don't want to upgrade my ad"
          checked={data.skipPromo}
          onChange={(e) =>
            update({ skipPromo: e.target.checked, promotionId: e.target.checked ? null : data.promotionId })
          }
        />
      </div>
    </div>
  )
}
