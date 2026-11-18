'use client'

import type { ChangeEvent, RefObject } from 'react'
import { campaignObjectiveConfigs, isValidHttpsUrl, type ObjectiveField } from '@/features/advertiser/campaignObjectives'
import type { CampaignDraft, CampaignObjective, LeadFormDraft, LeadFormField, ObjectiveDetails } from '@/types/campaign'

type Props = {
  draft: CampaignDraft
  updateDraft: (update: (current: CampaignDraft) => CampaignDraft, undoable?: boolean) => void
  beginFieldEdit: () => void
  finishFieldEdit: () => void
  uploadImage: (event: ChangeEvent<HTMLInputElement>) => void
  imageError: string
  imageUploadButton: RefObject<HTMLButtonElement | null>
}

export function ObjectiveAdStep(props: Props) {
  const objective = isObjective(props.draft.objective) ? props.draft.objective : 'Get website visits'
  const config = campaignObjectiveConfigs[objective]

  return (
    <div className="min-w-0">
      <h1 className="text-2xl font-bold text-navy-900">{config.adTitle}</h1>
      <p className="mt-2 text-sm text-slate-600">{config.adHelper}</p>
      <div className="mt-5 min-w-0 space-y-4">
        {config.fields.map((field) => <ObjectiveFieldView key={field.id} {...props} objective={objective} field={field} />)}
      </div>
    </div>
  )
}

function ObjectiveFieldView({ objective, field, draft, updateDraft, beginFieldEdit, finishFieldEdit, uploadImage, imageError, imageUploadButton }: Props & { objective: CampaignObjective; field: ObjectiveField }) {
  const labelClass = 'block text-sm font-semibold text-navy-900'
  const inputClass = 'mt-2 h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'

  if (field.kind === 'headline') return (
    <label className={labelClass} htmlFor="headline">{field.label}
      <input id="headline" value={draft.headline} maxLength={60} onFocus={beginFieldEdit} onBlur={finishFieldEdit} onChange={(event) => updateDraft((current) => ({ ...current, headline: event.target.value }))} className={inputClass} placeholder="A short headline" />
      <span className="mt-1 block text-xs font-normal text-slate-500">{field.helper} {draft.headline.length}/40</span>
    </label>
  )
  if (field.kind === 'text') return (
    <label className={labelClass} htmlFor="ad-text">{field.label}
      <textarea id="ad-text" value={draft.text} maxLength={200} onFocus={beginFieldEdit} onBlur={finishFieldEdit} onChange={(event) => updateDraft((current) => ({ ...current, text: event.target.value }))} className="mt-2 min-h-24 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" placeholder="What should people know?" />
      <span className="mt-1 block text-xs font-normal text-slate-500">{field.helper} {draft.text.length}/125</span>
    </label>
  )
  if (field.kind === 'image' || field.kind === 'video-image') return (
    <div>
      <span className={labelClass}>{field.label} <span className="font-normal text-slate-500">(optional)</span></span>
      <p className="mt-1 text-xs text-slate-500">{field.helper}</p>
      <input id="campaign-image" type="file" accept={field.kind === 'video-image' ? 'image/*,video/*' : 'image/*'} onChange={uploadImage} className="sr-only" />
      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-3">
        <button ref={imageUploadButton} type="button" onClick={() => document.getElementById('campaign-image')?.click()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">{draft.imageName ? 'Change image or video' : 'Add an image'} </button>
        {draft.imageName && <span className="max-w-full truncate text-sm text-slate-600">{draft.imageName}</span>}
      </div>
      {imageError && <p role="alert" className="mt-2 text-sm text-red-700">{imageError}</p>}
    </div>
  )
  if (field.kind === 'website' || field.kind === 'store-url') {
    const error = draft.url && !isValidHttpsUrl(draft.url) ? 'Enter a complete https:// URL.' : ''
    return (
      <label className={labelClass} htmlFor="website-url">{field.label}{field.required ? ' *' : ''}
        <input id="website-url" type="url" inputMode="url" value={draft.url} onFocus={beginFieldEdit} onBlur={finishFieldEdit} onChange={(event) => updateDraft((current) => ({ ...current, url: event.target.value }))} aria-invalid={Boolean(error)} className={inputClass} placeholder="https://example.com" />
        <span className="mt-1 block text-xs font-normal text-slate-500">{field.helper}</span>
        {error && <span className="mt-1 block text-xs font-normal text-red-700">{error}</span>}
      </label>
    )
  }
  if (field.kind === 'tracking') {
    const details = objective === 'Get website visits' ? draft.objectiveDetails : null
    return details?.objective === 'Get website visits' ? (
      <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-navy-900">
        <input type="checkbox" checked={details.trackingTags} onChange={(event) => updateDetails(updateDraft, details, { trackingTags: event.target.checked })} className="mt-1 accent-brand-600" />
        <span><span className="block font-semibold">{field.label}</span><span className="mt-1 block text-xs text-slate-500">{field.helper}</span></span>
      </label>
    ) : null
  }
  if (field.kind === 'lead-form') return objective === 'Get leads' && draft.objectiveDetails.objective === 'Get leads' ? (
    <LeadFormBuilder form={draft.objectiveDetails.leadForm} updateDraft={updateDraft} />
  ) : null
  if (field.kind === 'product-name' || field.kind === 'price' || field.kind === 'offer-price' || field.kind === 'offer-date') {
    if (draft.objectiveDetails.objective !== 'Get sales') return null
    const key = field.kind === 'product-name' ? 'productName' : field.kind === 'price' ? 'price' : field.kind === 'offer-price' ? 'offerPrice' : 'offerEndDate'
    const value = draft.objectiveDetails[key]
    const inputType = field.kind === 'price' || field.kind === 'offer-price' ? 'number' : field.kind === 'offer-date' ? 'date' : 'text'
    return (
      <label className={labelClass} htmlFor={field.id}>{field.label}{field.required ? ' *' : ''}
        <input id={field.id} type={inputType} min={inputType === 'number' ? '0' : undefined} step={inputType === 'number' ? '0.01' : undefined} value={value} onFocus={beginFieldEdit} onBlur={finishFieldEdit} onChange={(event) => updateDetails(updateDraft, draft.objectiveDetails, { [key]: event.target.value })} className={inputClass} placeholder={field.kind === 'price' || field.kind === 'offer-price' ? '0.00' : undefined} />
        <span className="mt-1 block text-xs font-normal text-slate-500">{field.helper}</span>
      </label>
    )
  }
  if (field.kind === 'brand-name' || field.kind === 'tagline') {
    if (draft.objectiveDetails.objective !== 'Build awareness') return null
    const key = field.kind === 'brand-name' ? 'brandName' : 'tagline'
    return (
      <label className={labelClass} htmlFor={field.id}>{field.label} *
        <input id={field.id} value={draft.objectiveDetails[key]} onFocus={beginFieldEdit} onBlur={finishFieldEdit} onChange={(event) => updateDetails(updateDraft, draft.objectiveDetails, { [key]: event.target.value })} className={inputClass} />
        <span className="mt-1 block text-xs font-normal text-slate-500">{field.helper}</span>
      </label>
    )
  }
  if (field.kind === 'button') {
    const details = draft.objectiveDetails
    return (
      <label className={labelClass} htmlFor="cta">{field.label}
        <select id="cta" value={details.buttonText} onFocus={beginFieldEdit} onBlur={finishFieldEdit} onChange={(event) => updateDetails(updateDraft, details, { buttonText: event.target.value })} className={inputClass}>
          {campaignObjectiveConfigs[objective].buttonOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
        <span className="mt-1 block text-xs font-normal text-slate-500">{field.helper}</span>
      </label>
    )
  }
  return null
}

function LeadFormBuilder({ form, updateDraft }: { form: LeadFormDraft; updateDraft: Props['updateDraft'] }) {
  const updateForm = (update: (current: LeadFormDraft) => LeadFormDraft) => updateDraft((current) => {
    if (current.objectiveDetails.objective !== 'Get leads') return current
    return { ...current, objectiveDetails: { ...current.objectiveDetails, leadForm: update(current.objectiveDetails.leadForm) } }
  })
  const fieldInputClass = 'mt-2 h-10 w-full min-w-0 rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'

  return (
    <fieldset className="min-w-0 space-y-4 rounded-lg border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-navy-900">Lead form</legend>
      <label className="block text-sm font-medium text-navy-900">Form name *
        <input value={form.name} onChange={(event) => updateForm((current) => ({ ...current, name: event.target.value }))} className={fieldInputClass} placeholder="Contact request" />
      </label>
      <div>
        <p className="text-sm font-medium text-navy-900">Fields to collect</p>
        <div className="mt-2 space-y-2">
          {form.fields.map((field) => <LeadFieldRow key={field.id} field={field} updateForm={updateForm} />)}
        </div>
      </div>
      <label className="block text-sm font-medium text-navy-900">Short introduction
        <textarea value={form.introText} onChange={(event) => updateForm((current) => ({ ...current, introText: event.target.value }))} className="mt-2 min-h-16 w-full rounded-lg border border-slate-300 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" placeholder="Tell people what happens after they submit." />
      </label>
      <label className="block text-sm font-medium text-navy-900">Consent checkbox text
        <input value={form.consentText} onChange={(event) => updateForm((current) => ({ ...current, consentText: event.target.value }))} className={fieldInputClass} />
      </label>
      <label className="block text-sm font-medium text-navy-900">Privacy policy URL *
        <input type="url" inputMode="url" value={form.privacyPolicyUrl} onChange={(event) => updateForm((current) => ({ ...current, privacyPolicyUrl: event.target.value }))} className={fieldInputClass} placeholder="https://example.com/privacy" />
        {form.privacyPolicyUrl && !isValidHttpsUrl(form.privacyPolicyUrl) && <span className="mt-1 block text-xs font-normal text-red-700">Enter a complete https:// URL.</span>}
      </label>
      <label className="block text-sm font-medium text-navy-900">Thank-you message
        <textarea value={form.thankYouMessage} onChange={(event) => updateForm((current) => ({ ...current, thankYouMessage: event.target.value }))} className="mt-2 min-h-16 w-full rounded-lg border border-slate-300 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />
      </label>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <label className="block min-w-0 text-sm font-medium text-navy-900">Optional button label
          <input value={form.thankYouButtonLabel} onChange={(event) => updateForm((current) => ({ ...current, thankYouButtonLabel: event.target.value }))} className={fieldInputClass} placeholder="Visit our website" />
        </label>
        <label className="block min-w-0 text-sm font-medium text-navy-900">Optional button link
          <input type="url" inputMode="url" value={form.thankYouButtonUrl} onChange={(event) => updateForm((current) => ({ ...current, thankYouButtonUrl: event.target.value }))} className={fieldInputClass} placeholder="https://example.com" />
        </label>
      </div>
    </fieldset>
  )
}

function LeadFieldRow({ field, updateForm }: { field: LeadFormField; updateForm: (update: (current: LeadFormDraft) => LeadFormDraft) => void }) {
  const setField = (update: (value: LeadFormField) => LeadFormField) => updateForm((current) => ({
    ...current,
    fields: current.fields.map((item) => item.id === field.id ? update(item) : item),
  }))
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-slate-50 p-3">
      <label className="flex min-w-28 flex-1 items-center gap-2 text-sm text-navy-900">
        <input type="checkbox" checked={field.enabled} onChange={(event) => setField((current) => ({ ...current, enabled: event.target.checked, required: event.target.checked ? current.required : false }))} className="accent-brand-600" />
        {field.id === 'custom' ? 'Custom question' : field.label}
      </label>
      {field.id === 'custom' && field.enabled && <input aria-label="Custom lead form question" value={field.label} onChange={(event) => setField((current) => ({ ...current, label: event.target.value }))} className="h-9 w-full min-w-0 rounded-lg border border-slate-300 px-2 text-sm sm:w-48" placeholder="Your question" />}
      {field.enabled && <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={field.required} onChange={(event) => setField((current) => ({ ...current, required: event.target.checked }))} className="accent-brand-600" />Required</label>}
    </div>
  )
}

function updateDetails<T extends ObjectiveDetails>(updateDraft: Props['updateDraft'], current: ObjectiveDetails, patch: Partial<T>) {
  updateDraft((draft) => {
    if (draft.objectiveDetails.objective !== current.objective) return draft
    const details = { ...draft.objectiveDetails, ...patch } as ObjectiveDetails
    const buttonText = 'buttonText' in details ? details.buttonText : draft.cta
    return { ...draft, objectiveDetails: details, cta: buttonText }
  })
}

function isObjective(value: CampaignDraft['objective']): value is CampaignObjective {
  return value === 'Get website visits' || value === 'Get leads' || value === 'Get sales' || value === 'Build awareness'
}
