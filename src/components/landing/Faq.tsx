import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/primitives/accordion'

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
      <Accordion type="single" collapsible defaultValue="faq-0" className="space-y-3">
        {faqs.map(([q, a], i) => (
          <AccordionItem key={q} value={`faq-${i}`} className="rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
            <AccordionTrigger className="py-4 text-left text-navy-900 hover:no-underline">{q}</AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-6 text-slate-600">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}