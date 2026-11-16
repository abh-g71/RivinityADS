'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Bot, FileText, Sparkles } from 'lucide-react'
import { campaignTemplates, campaignDraftStorageKey } from '@/features/advertiser/campaignTemplates'
import { useToast } from '@/components/shared/Toast'

export function NewCampaignStart() {
  const router = useRouter()
  const toast = useToast()

  function startTemplate(templateId: string) {
    const template = campaignTemplates.find((item) => item.id === templateId)
    if (!template) return
    try {
      window.localStorage.setItem(campaignDraftStorageKey, JSON.stringify(template.draft))
      router.push(`/campaigns/new/manual?template=${templateId}`)
    } catch (error) {
      console.error('Unable to save campaign template', error)
      toast({ title: 'Could not save this draft', description: 'Check that browser storage is available and try again.', variant: 'error' })
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/campaigns" className="text-sm font-medium text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        ← Back to campaigns
      </Link>
      <div className="mt-7 max-w-2xl">
        <p className="text-sm font-semibold text-brand-700">A simple way to get started</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">How would you like to create your campaign?</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">Start with a few guided choices. Your draft is saved here, and nothing goes live without your approval.</p>
      </div>

      <section aria-label="Campaign creation methods" className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/campaigns/new/ai" className="group rounded-xl border-2 border-brand-600 bg-white p-5 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Bot className="h-6 w-6" aria-hidden="true" /></span>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Fastest</span>
          </div>
          <h2 className="mt-5 text-xl font-semibold text-navy-900">Create with AI</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Tell the assistant what you need, then review and edit its draft.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">Start with AI <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
        </Link>
        <Link href="/campaigns/new/manual" className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-navy-800"><FileText className="h-6 w-6" aria-hidden="true" /></span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">About 2 minutes</span>
          </div>
          <h2 className="mt-5 text-xl font-semibold text-navy-900">Create manually</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Choose a goal, audience, budget, and ad in four short steps.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">Set up manually <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
        </Link>
      </section>

      <section className="mt-10" aria-labelledby="quick-start-heading">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-600" aria-hidden="true" />
          <h2 id="quick-start-heading" className="text-base font-semibold text-navy-900">Or start with a template</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">Each template fills in a complete editable draft. Change anything before you save.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {campaignTemplates.map((template) => (
            <button key={template.id} type="button" onClick={() => startTemplate(template.id)} className="min-h-28 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-brand-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <span className="block font-semibold text-navy-900">{template.name}</span>
              <span className="mt-1 block text-sm leading-5 text-slate-600">{template.description}</span>
              <span className="mt-3 block text-sm font-medium text-brand-700">Use template →</span>
            </button>
          ))}
        </div>
      </section>
      <div className="mt-8 border-t border-slate-200 pt-5">
        <Link href="/campaigns/new/advanced" className="text-sm text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          Advanced setup
        </Link>
        <span className="ml-2 text-xs text-slate-500">Open the full campaign form with additional settings.</span>
      </div>
    </main>
  )
}
