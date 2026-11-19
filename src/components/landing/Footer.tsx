import Link from 'next/link'

export function Footer() {
  return (
    <footer id="closing-cta" className="mx-auto w-full max-w-6xl px-4 pb-8 pt-4 sm:px-6">
      <div className="rounded-lg bg-dark-card px-5 py-12 text-center text-white sm:px-8 sm:py-14">
        <h2 className="text-3xl font-bold tracking-tight">Ready to make a campaign?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300">Start with a goal. You can review and edit everything before it is submitted.</p>
        <Link href="/campaigns/new" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-dark-card">Create a campaign</Link>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">RivinityADS</span>
        <span>Product preview · Displayed data is simulated</span>
      </div>
    </footer>
  )
}
