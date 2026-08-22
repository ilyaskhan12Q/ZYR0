import { Reveal } from './Reveal';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  return (
    <Reveal className={`flex flex-col gap-4 ${align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
      {eyebrow && <span className="rl-eyebrow">{eyebrow}</span>}
      <h2 className="rl-display rl-heading-text text-[var(--rl-ink)] max-w-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="rl-subheading text-[var(--rl-muted)] max-w-xl">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
