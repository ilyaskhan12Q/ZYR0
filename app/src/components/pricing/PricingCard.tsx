import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import type { BillingInterval } from './BillingToggle';

export interface PricingFeature {
  text: string;
  badge?: 'Live' | 'Early Access' | 'In Rollout';
}

export interface PricingCardData {
  id: 'free' | 'pro' | 'custom';
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlySubtext?: string;
  features: PricingFeature[];
  ctaLabel: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  highlighted?: boolean;
}

interface PricingCardProps {
  card: PricingCardData;
  interval: BillingInterval;
}

export default function PricingCard({ card, interval }: PricingCardProps) {
  const isHighlighted = card.highlighted;
  const isYearly = interval === 'yearly';

  const price = isYearly ? card.yearlyPrice : card.monthlyPrice;
  const period = card.id === 'custom' ? '' : '/mo';

  return (
    <div
      className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
        isHighlighted
          ? 'bg-card border-2 border-accent shadow-lg hover:-translate-y-1'
          : 'bg-card border border-border hover:border-border/80 shadow-sm hover:shadow-md hover:-translate-y-1'
      }`}
    >
      {/* Popular / Pro Highlight Pill */}
      {card.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-foreground text-background font-semibold shadow-sm">
            {isHighlighted && <Sparkles className="w-3 h-3" />}
            {card.badge}
          </span>
        </div>
      )}

      <div>
        {/* Tier Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold font-display tracking-tight text-foreground">
            {card.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed min-h-[34px]">
            {card.description}
          </p>
        </div>

        {/* Pricing Display */}
        <div className="mb-6 pb-6 border-b border-border/70">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-foreground">
              {price}
            </span>
            {period && (
              <span className="text-sm font-medium text-muted-foreground">
                {period}
              </span>
            )}
          </div>
          {isYearly && card.yearlySubtext && (
            <p className="text-[11px] font-medium text-muted-foreground mt-1.5">
              {card.yearlySubtext}
            </p>
          )}
          {!isYearly && card.id === 'pro' && (
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Billed monthly. Cancel anytime.
            </p>
          )}
        </div>

        {/* Feature List */}
        <div className="space-y-3 mb-8">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Included Capabilities
          </span>
          <ul className="space-y-2.5">
            {card.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                <Check className="w-3.5 h-3.5 text-foreground shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug">
                  <span>{feat.text}</span>
                  {feat.badge && (
                    <span className="ml-1.5 text-[10px] font-mono text-muted-foreground">
                      ({feat.badge})
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Card Action */}
      <div className="pt-2">
        {card.onCtaClick ? (
          <button
            type="button"
            onClick={card.onCtaClick}
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              isHighlighted
                ? 'bg-accent text-white hover:bg-accent/90'
                : 'border border-border text-foreground hover:bg-muted'
            }`}
          >
            <span>{card.ctaLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            to={card.ctaHref || '/register'}
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              isHighlighted
                ? 'bg-accent text-white hover:bg-accent/90'
                : 'border border-border text-foreground hover:bg-muted'
            }`}
          >
            <span>{card.ctaLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
