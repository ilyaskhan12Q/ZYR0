import { HelpCircle } from 'lucide-react';
import { Reveal, SectionHeading } from './SectionHeading';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { FAQS } from './team-data';

export function FaqSection() {
  return (
    <section className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto" id="team-faq">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions,"
          accent="answered honestly"
          description="If you do not find your answer here, message us on the official ZYR0 channels — a real person replies."
          icon={HelpCircle}
        />

        <Reveal className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={faq.question}
                value={`item-${i}`}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 px-5 sm:px-6 shadow-lg transition-colors hover:border-slate-300 dark:hover:border-white/20"
              >
                <AccordionTrigger className="text-base font-semibold text-slate-900 dark:text-white py-5 hover:no-underline [&[data-state=open]]:text-blue-600 dark:[&[data-state=open]]:text-sky-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p className="pb-2">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}