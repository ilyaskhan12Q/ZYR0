import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
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
  const period = card.periodText !== undefined ? card.periodText : (card.monthlyPrice === 'Custom' ? '' : '/mo');
  const Icon = card.ctaIcon || ArrowRight;

  const getButtonClasses = () => {
    if (isHighlighted || card.ctaVariant === 'primary') {
      return 'bg-accent text-white hover:bg-accent/90 shadow-sm';
    }
    if (card.ctaVariant === 'soft-accent') {
      return 'bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20';
    }
    return 'border border-border text-foreground hover:bg-muted';
  };

  return (
    <div
      className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 bg-card ${
        isHighlighted
          ? 'border-2 border-accent/60 ring-1 ring-accent/30 shadow-xl shadow-accent/5 hover:-translate-y-1'
          : 'border border-border hover:border-foreground/20 shadow-sm hover:shadow-md hover:-translate-y-1'
      }`}
    >
      {/* Top Badge (if any) */}
      {card.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-foreground text-background font-semibold shadow-sm">
            {isHighlighted && <Sparkles className="w-3 h-3" />}
            {card.badge}
          </span>
        </div>
      )}

      <div>
        {/* Top Product Suite Tags (Enterprise / Business) */}
        {card.topProducts && card.topProducts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {card.topProducts.map((p) => (
              <span
                key={p}
                className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border border-border bg-muted/60 text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        )}

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
        <div>
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
          {!isYearly && card.yearlySubtext && card.monthlyPrice !== '$0' && card.monthlyPrice !== 'Custom' && (
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Billed monthly. Cancel anytime.
            </p>
          )}
        </div>

        {/* Action Button (Positioned Below Price) */}
        <div className="mt-5 mb-6">
          {card.onCtaClick ? (
            <button
              type="button"
              onClick={card.onCtaClick}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${getButtonClasses()}`}
            >
              <span>{card.ctaLabel}</span>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              to={card.ctaHref || '/register'}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${getButtonClasses()}`}
            >
              <span>{card.ctaLabel}</span>
              <Icon className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Feature List */}
        <div className="pt-6 border-t border-border">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold block mb-3">
            Included Capabilities
          </span>
          <ul className="space-y-2.5">
            {card.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                <Check
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                    isHighlighted ? 'text-accent' : 'text-foreground'
                  }`}
                />
                <div className="flex-1 leading-snug">
                  {feat.highlight && (
                    <span className="font-semibold text-foreground mr-1.5">
                      {feat.highlight}
                    </span>
                  )}
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
    </div>
  );
}
