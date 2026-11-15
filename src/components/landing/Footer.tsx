import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <div className="rounded-3xl bg-navy-900 px-6 py-14 text-center text-white">
        <h2 className="text-3xl font-bold">Ready to optimize your ads?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">
          Explore the advertiser and publisher workflows in the RivinityADS prototype.
        </p>
        <Link href="/signup" className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 active:scale-[0.98]">
          Get Started for Free
        </Link>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <span className="font-semibold text-navy-900">RivinityADS</span>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-4">
          <Link href="/advertisers" className="hover:text-navy-900">Advertisers</Link>
          <Link href="/publishers" className="hover:text-navy-900">Publishers</Link>
          <Link href="/ad-formats" className="hover:text-navy-900">Ad formats</Link>
          <Link href="/login" className="hover:text-navy-900">Sign in</Link>
        </nav>
      </div>
    </footer>
  )
}