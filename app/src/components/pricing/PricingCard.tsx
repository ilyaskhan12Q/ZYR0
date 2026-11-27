import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { BillingInterval } from './BillingToggle';

export interface PricingFeature {
  highlight?: string;
  text: string;
  badge?: 'Live' | 'Early Access' | 'In Rollout';
}

export interface PricingCardData {
  id: string;
  name: string;
  badge?: string;
  topProducts?: string[];
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  periodText?: string;
  yearlySubtext?: string;
  features: PricingFeature[];
  ctaLabel: string;
  ctaHref?: string;
  ctaIcon?: React.ElementType;
  onCtaClick?: () => void;
  highlighted?: boolean;
  ctaVariant?: 'primary' | 'soft-accent' | 'outline';
}

interface PricingCardProps {
  card: PricingCardData;
  interval: BillingInterval;
}

export default function PricingCard({ card, interval }: PricingCardProps) {
  const isHighlighted = card.highlighted;
  const isYearly = interval === 'yearly';

  const price = isYearly ? card.yearlyPrice : card.monthlyPrice;
  const period =
    card.periodText !== undefined
      ? card.periodText
      : card.monthlyPrice === 'Custom'
        ? ''
        : '/mo';
  const Icon = card.ctaIcon || ArrowRight;

  const buttonBase =
    'inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-xs sm:text-sm font-semibold transition-colors';

  const getButtonClasses = () => {
    if (isHighlighted || card.ctaVariant === 'primary') {
      return 'bg-accent text-white hover:bg-accent/90';
    }
    if (card.ctaVariant === 'soft-accent') {
      return 'bg-accent/10 text-accent hover:bg-accent/15';
    }
    return 'border border-border text-foreground hover:border-foreground/40';
  };

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-7 sm:p-8 ${
        isHighlighted ? 'border-accent/50' : 'border-border'
      }`}
    >
      {isHighlighted && (
        <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
      )}

      <div>
        {card.badge && (
          <div className="mb-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] ${
                isHighlighted
                  ? 'bg-accent/10 text-accent'
                  : 'border border-border text-muted-foreground'
              }`}
            >
              {card.badge}
            </span>
          </div>
        )}

        <h3 className="font-serif text-3xl leading-none text-foreground">
          {card.name}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {card.description}
        </p>

        {card.topProducts && card.topProducts.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {card.topProducts.map((p) => (
              <span
                key={p}
                className="inline-block rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        )}

        <div className="mt-7 flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-[42px]">
            {price}
          </span>
          {period && (
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              {period}
            </span>
          )}
        </div>
        {isYearly && card.yearlySubtext && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {card.yearlySubtext}
          </p>
        )}
        {!isYearly &&
          card.yearlySubtext &&
          card.monthlyPrice !== '$0' &&
          card.monthlyPrice !== 'Custom' && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Billed monthly. Cancel anytime.
            </p>
          )}

        <div className="mt-5">
          {card.onCtaClick ? (
            <button
              type="button"
              onClick={card.onCtaClick}
              className={`${buttonBase} ${getButtonClasses()} cursor-pointer`}
            >
              <span>{card.ctaLabel}</span>
              <Icon className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link
              to={card.ctaHref || '/register'}
              className={`${buttonBase} ${getButtonClasses()}`}
            >
              <span>{card.ctaLabel}</span>
              <Icon className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <ul className="mt-7 space-y-4">
          {card.features.map((feat, idx) => (
            <li
              key={idx}
              className="text-sm leading-relaxed text-muted-foreground"
            >
              {feat.highlight && (
                <span className="mr-1.5 font-semibold text-foreground/80">
                  {feat.highlight}
                </span>
              )}
              <span>{feat.text}</span>
              {feat.badge && (
                <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
                  ({feat.badge})
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
