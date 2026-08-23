import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const STEPS = [
  {
    label: 'QUESTION',
    text: 'One question can open an entire field of research. But traditional search gives you noise, not knowledge.',
  },
  {
    label: 'SURFACE',
    text: 'Surface-level search returns surface-level understanding. You need depth — across sources, across disciplines.',
  },
  {
    label: 'DEPTH',
    text: 'ZYROO digs deeper. Academic papers, web sources, real-time data. Every citation verified. Every claim grounded.',
  },
];

export function EditorialStatement() {
  return (
    <section className="rl-dark-section rl-section-full">
      <div className="rl-section">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16" stagger={0.12}>
          {STEPS.map((step) => (
            <StaggerItem key={step.label} variant="fade-up">
              <div className="border-t border-[#333] pt-6">
                <p className="rl-eyebrow-light text-[#657C68] mb-4">{step.label}</p>
                <p className="text-[#cccccc] text-base leading-relaxed">{step.text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
