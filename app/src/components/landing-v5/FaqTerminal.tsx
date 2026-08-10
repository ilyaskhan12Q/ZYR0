import { Terminal } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQ_ITEMS } from './faq-data';
import { Reveal } from './motion';

export function FaqTerminal() {
  return (
    <section className="py-20 lg:py-28 content-visibility-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-12">
          <span className="v5-eyebrow text-[#38bdf8]">Risk Reversal</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Questions, answered{' '}
            <span className="font-accent text-[#38bdf8]">in plain text.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="v5-card rounded-2xl overflow-hidden">
            {/* Terminal chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 inline-flex items-center gap-2 v5-mono text-[11px] text-white/40">
                <Terminal className="w-3.5 h-3.5" />
                ~/zyro/faq — zsh
              </span>
            </div>

            <Accordion type="single" collapsible className="divide-y divide-white/[0.06]">
              {FAQ_ITEMS.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="border-none">
                  <AccordionTrigger className="px-5 sm:px-7 py-5 hover:bg-white/[0.02] hover:no-underline [&>svg]:text-[#38bdf8]">
                    <span className="text-left v5-mono text-sm sm:text-[15px]">
                      <span className="text-[#38bdf8]">~/zyro/faq $</span>{' '}
                      <span className="text-white/50">cat</span>{' '}
                      <span className="text-white">{item.filename}</span>
                      <span className="block mt-1.5 text-[13px] text-white/60 font-normal">
                        # {item.question}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 sm:px-7 pb-6">
                    <p className="v5-mono text-sm leading-relaxed text-white/70 pl-4 border-l-2 border-[#10b981]/40">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
