import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/primitives/accordion'

const faqs = [
  ['What is RivinityADS?', 'A demo workspace for exploring advertiser campaign setup and publisher tools.'],
  ['Does a campaign go live when I publish?', 'No. This prototype uses mock data and does not deliver ads or process payments.'],
  ['How much does advertising cost?', 'You choose a daily budget in the campaign setup. Any result ranges shown are illustrative mock estimates, not a forecast.'],
  ['Can I change my campaign before publishing?', 'Yes. Review the draft, select a value to edit it, and save it in this browser.'],
]

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2">
      <div>
        <p className="text-sm font-semibold text-brand-700">FAQ</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy-900">A few quick answers.</h2>
      </div>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map(([question, answer], index) => (
          <AccordionItem key={question} value={`faq-${index}`} className="rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
            <AccordionTrigger className="py-4 text-left text-navy-900 hover:no-underline">{question}</AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-6 text-slate-600">{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
