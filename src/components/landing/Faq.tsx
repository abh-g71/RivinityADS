const faqs = [
  ['What is RivinityADS?', 'RivinityADS is a frontend prototype for exploring advertiser campaign workflows and publisher website tools.'],
  ['Does this site deliver ads or process payments?', 'No. The prototype uses mock data and does not connect to ad delivery, payment, or tracking services.'],
  ['Are the prices real?', 'No. Any pricing shown is illustrative mock content and is not an offer or live platform pricing.'],
]

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2">
      <div>
        <p className="font-mono text-xs text-slate-500">[FAQ]</p>
        <h2 className="mt-2 text-3xl font-bold">Got questions? We have answers.</h2>
      </div>
      <div className="space-y-3">
        {faqs.map(([q, a], i) => (
          <details key={q} open={i === 0} className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <summary className="cursor-pointer list-none pr-6 font-medium text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">{q}<span className="text-brand-700 transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span></span>
            </summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}