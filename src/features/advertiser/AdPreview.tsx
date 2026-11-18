'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { CampaignDraft } from '@/types/campaign'

type Placement = 'feed' | 'story' | 'banner'
type BannerSize = '728x90' | '300x250'

const sizes: Record<Placement, string> = {
  feed: '1080 × 1080',
  story: '1080 × 1920',
  banner: '728 × 90',
}

export function AdPreview({ draft }: { draft: CampaignDraft }) {
  const [placement, setPlacement] = useState<Placement>('feed')
  const [bannerSize, setBannerSize] = useState<BannerSize>('728x90')
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile')
  const ratio = placement === 'feed' ? '1 / 1' : placement === 'story' ? '9 / 16' : bannerSize === '728x90' ? '728 / 90' : '6 / 5'
  const frameSize = placement === 'banner' ? (bannerSize === '728x90' ? '728 × 90' : '300 × 250') : sizes[placement]
  const titleTooLong = draft.headline.length > 40
  const textTooLong = draft.text.length > 125

  return (
    <section aria-labelledby="preview-title" className="space-y-4 lg:h-full lg:flex lg:flex-col">
      <div>
        <h3 id="preview-title" className="font-semibold text-navy-900">Live ad preview</h3>
        <p className="mt-1 text-sm text-slate-600">See how your ad may look before you save it.</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Preview placement">
        {(['feed', 'story', 'banner'] as const).map((value) => (
          <button key={value} type="button" onClick={() => setPlacement(value)} aria-pressed={placement === value} className={`min-h-10 rounded-lg px-3 text-sm font-medium capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${placement === value ? 'bg-brand-600 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
            {value}
          </button>
        ))}
      </div>
      {placement === 'banner' && (
        <div className="flex gap-2" role="group" aria-label="Banner size">
          {(['728x90', '300x250'] as const).map((value) => (
            <button key={value} type="button" onClick={() => setBannerSize(value)} aria-pressed={bannerSize === value} className={`min-h-9 rounded-lg px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${bannerSize === value ? 'bg-brand-50 text-brand-700' : 'border border-slate-200 text-slate-600'}`}>
              {value.replace('x', ' × ')}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{frameSize} px</span>
        <div className="flex rounded-lg bg-slate-100 p-1" role="group" aria-label="Preview device">
          {(['mobile', 'desktop'] as const).map((value) => (
            <button key={value} type="button" onClick={() => setDevice(value)} aria-pressed={device === value} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${device === value ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600'}`}>{value}</button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 p-3 sm:p-5">
        <div
          className={`mx-auto flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-[max-width] ${placement === 'banner' && bannerSize === '728x90' ? 'flex-row' : ''} ${device === 'mobile' ? 'max-w-[280px]' : 'max-w-[560px]'}`}
          style={{ aspectRatio: ratio }}
          aria-label={`${placement} ad preview, ${frameSize} pixels, ${device} view`}
        >
          {placement === 'banner' && bannerSize === '728x90' ? (
            <div className="flex h-full items-center gap-2 p-2">
              <div className="relative h-full w-[22%] shrink-0 overflow-hidden rounded-lg bg-brand-50">
                {draft.imageDataUrl && <Image src={draft.imageDataUrl} alt="Campaign image" fill unoptimized className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold text-navy-900">{draft.headline || 'Your headline'}</p>
                <p className="mt-1 line-clamp-2 text-[9px] text-slate-600">{draft.text || 'Your ad text'}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-brand-600 px-2 py-1 text-[9px] font-semibold text-white">{draft.cta}</span>
            </div>
          ) : (
            <>
              <div className={`relative w-full flex-none bg-brand-50 ${placement === 'story' ? 'h-[48%]' : bannerSize === '300x250' && placement === 'banner' ? 'h-[42%]' : 'h-[48%]'}`}>
                {draft.imageDataUrl
                  ? <Image src={draft.imageDataUrl} alt="Campaign image" fill unoptimized className="object-cover" />
                  : <div className="flex h-full items-center justify-center text-xs text-slate-500">Add an image to preview it here</div>}
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden p-3 sm:p-4">
                <p className="text-[9px] font-medium uppercase tracking-wide text-slate-500">Sponsored</p>
                <p className="line-clamp-2 text-sm font-semibold text-navy-900">{draft.headline || 'Your headline'}</p>
                <p className="line-clamp-3 text-xs leading-5 text-slate-600">{draft.text || 'Your ad text will appear here as you write it.'}</p>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                  <span className="truncate text-[10px] text-slate-500">{draft.url || 'your-website.com'}</span>
                  <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-navy-900">{draft.cta}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-live="polite">
        <span className={titleTooLong ? 'text-amber-700' : 'text-slate-500'}>Headline {draft.headline.length}/40</span>
        <span className={textTooLong ? 'text-amber-700' : 'text-slate-500'}>Ad text {draft.text.length}/125</span>
      </div>
      <ul className="space-y-1 text-xs text-amber-800" aria-live="polite">
        {!draft.imageDataUrl && <li>No image added yet. Your ad may be less noticeable without one.</li>}
        {titleTooLong && <li>Headline is over 40 characters. Shorten it to fit more placements.</li>}
        {textTooLong && <li>Ad text is over 125 characters. Shorten it for a clearer preview.</li>}
      </ul>
    </section>
  )
}
