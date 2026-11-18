'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { CampaignDraft } from '@/types/campaign'

type Placement = 'feed' | 'story' | 'banner'

export function AdPreview({ draft }: { draft: CampaignDraft }) {
  const [placement, setPlacement] = useState<Placement>('feed')
  const [tab, setTab] = useState<'Ad' | 'Form'>('Ad')
  const leadDetails = draft.objectiveDetails.objective === 'Get leads' ? draft.objectiveDetails : null
  const salesDetails = draft.objectiveDetails.objective === 'Get sales' ? draft.objectiveDetails : null
  const awarenessDetails = draft.objectiveDetails.objective === 'Build awareness' ? draft.objectiveDetails : null
  const isLead = draft.objective === 'Get leads' && Boolean(leadDetails)
  const isSales = draft.objective === 'Get sales' && Boolean(salesDetails)
  const isAwareness = draft.objective === 'Build awareness' && Boolean(awarenessDetails)
  const form = leadDetails?.leadForm ?? null

  return <section aria-labelledby="preview-title" className="min-w-0 space-y-4">
    <div>
      <h3 id="preview-title" className="font-semibold text-navy-900">Live preview</h3>
      <p className="mt-1 text-sm text-slate-600">Sample preview of your campaign.</p>
    </div>
    {isLead && <div className="flex gap-2" role="tablist" aria-label="Preview type">
      {(['Ad', 'Form'] as const).map((value) => <button key={value} role="tab" aria-selected={tab === value} type="button" onClick={() => setTab(value)} className={`rounded-lg border px-3 py-2 text-sm font-medium ${tab === value ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}>{value}</button>)}
    </div>}
    {(!isAwareness || tab === 'Ad') && <div className="flex gap-2" role="group" aria-label="Preview placement">
      {(['feed', 'story', 'banner'] as const).map((value) => <button key={value} type="button" onClick={() => setPlacement(value)} aria-pressed={placement === value} className={`rounded-lg border px-3 py-2 text-sm capitalize ${placement === value ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}>{value}</button>)}
    </div>}
    {isLead && tab === 'Form' && form ? <div className="mx-auto w-full max-w-[300px] rounded-[2rem] border-[6px] border-slate-800 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{form.name || 'Lead form'}</p>
      <h4 className="mt-3 text-lg font-semibold text-navy-900">{draft.headline || 'Your headline'}</h4>
      <p className="mt-1 text-sm text-slate-600">{form.introText || 'Share your details and we will be in touch.'}</p>
      <div className="mt-4 space-y-2">{form.fields.filter((field) => field.enabled).map((field) => <div key={field.id} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500">{field.label || 'Your answer'}{field.required ? ' *' : ''}</div>)}</div>
      <p className="mt-3 text-[10px] text-slate-500">{form.consentText}</p>
      <p className="mt-2 break-all text-[10px] text-brand-700">{form.privacyPolicyUrl || 'Privacy policy link'}</p>
      <button type="button" className="mt-4 w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white">{draft.objectiveDetails.buttonText}</button>
      <p className="mt-3 text-center text-xs text-slate-500">After submit: {form.thankYouMessage || 'Thank you.'}</p>
      {form.thankYouButtonLabel && <p className="mt-1 text-center text-xs text-brand-700">{form.thankYouButtonLabel}</p>}
    </div> : <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className={`relative flex items-center justify-center bg-slate-100 ${placement === 'story' ? 'aspect-[9/16]' : placement === 'banner' ? 'aspect-[3/1]' : 'aspect-[4/3]'}`}>
        {draft.imageDataUrl && <Image src={draft.imageDataUrl} alt="Campaign preview" fill unoptimized className="object-cover" />}
        {!draft.imageDataUrl && awarenessDetails && <div className="p-6 text-center"><p className="text-xl font-semibold text-navy-900">{awarenessDetails.brandName || 'Your brand'}</p><p className="mt-2 text-sm text-slate-600">{awarenessDetails.tagline || 'Your tagline'}</p>{awarenessDetails.mediaKind === 'video' && <span className="mt-2 inline-block rounded bg-white px-2 py-1 text-xs text-slate-600">Video sample</span>}</div>}
        {!draft.imageDataUrl && !isAwareness && <span className="text-xs text-slate-500">Add an image to preview it here</span>}
      </div>
      <div className="p-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Sponsored · {placement}</p>
        <p className="mt-2 text-base font-semibold text-navy-900">{awarenessDetails ? awarenessDetails.brandName || 'Your brand' : salesDetails ? salesDetails.productName || 'Product name' : draft.headline || 'Your headline'}</p>
        <p className="mt-1 text-sm text-slate-600">{awarenessDetails ? awarenessDetails.tagline || 'Your tagline' : draft.text || 'Your ad text will appear here.'}</p>
        {salesDetails && <div className="mt-3 flex items-baseline gap-2"><span className="font-semibold text-navy-900">₹{salesDetails.offerPrice || salesDetails.price || '0'}</span>{salesDetails.offerPrice && <span className="text-xs text-slate-500 line-through">₹{salesDetails.price}</span>}</div>}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3"><span className="min-w-0 truncate text-xs text-slate-500">{draft.url || (isSales ? 'Your store' : 'your-website.com')}</span><span className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-navy-900">{draft.objectiveDetails.buttonText}</span></div>
      </div>
    </div>}
    {isAwareness && <p className="text-center text-xs text-slate-500">Preview adapts to Feed, Story and Banner placements.</p>}
  </section>
}
