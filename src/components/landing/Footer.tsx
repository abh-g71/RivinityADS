import Link from 'next/link'

export function Footer() {
  return (
    <footer id="closing-cta" className="mx-auto w-full max-w-6xl px-4 pb-8 pt-4 sm:px-6">
      <div className="rounded-2xl bg-navy-900 px-5 py-12 text-center text-white sm:px-8 sm:py-14">
        <h2 className="text-3xl font-bold tracking-tight">Ready to make a campaign?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300">Start with a goal. You can review and edit everything before it is submitted.</p>
        <Link href="/campaigns/new" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900">Create a campaign</Link>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <span className="font-semibold text-navy-900">RivinityADS</span>
        <span>Product preview · Displayed data is simulated</span>
      </div>
    </footer>
  )
}
