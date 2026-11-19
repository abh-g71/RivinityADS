import { CheckCircle2, Compass, Wallet } from 'lucide-react'

const benefits = [
  { title: 'Start with one clear goal', text: 'Choose what you want your campaign to do, without sorting through a long list.', Icon: Compass },
  { title: 'See your spend up front', text: 'Review your daily budget and an illustrative results range before you continue.', Icon: Wallet },
  { title: 'Review before you publish', text: 'Check the audience, ad, and link together. Your approval is always required.', Icon: CheckCircle2 },
]

export function Features() {
  return (
    <section id="product" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold text-foreground">Made for a clearer start</p>
      <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight text-foreground">The important choices, without the clutter.</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {benefits.map(({ title, text, Icon }) => (
          <article key={title} className="rounded-lg border border-border bg-white p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="h-4 w-4" aria-hidden="true" /></span>
            <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
