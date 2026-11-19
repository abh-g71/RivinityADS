import Link from 'next/link'

export function Integrations() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
      <p className="font-mono text-xs text-muted-foreground">[ONE WORKSPACE]</p>
      <h2 className="mt-2 text-3xl font-bold text-foreground">Built for both sides of the ad network</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        Advertisers can explore campaign workflows while publishers can review website and placement tools. The prototype uses mock data and does not connect to external ad platforms.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/advertisers" className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">For advertisers</Link>
        <Link href="/publishers" className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">For publishers</Link>
      </div>
    </section>
  )
}