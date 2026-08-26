import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { hero } from './data';

export default function HeroSection() {
  return (
    <section className="ph-hero">
      <div className="ph-hero-bg">
        <div className="ph-hero-gradient" />
        <div className="ph-hero-dots" />
        <div className="ph-hero-line" />
      </div>

      <div className="ph-animate-in">
        <span className="ph-hero-tag">{hero.tag}</span>
      </div>

      <h1 className="ph-display ph-hero-heading ph-animate-in ph-animate-delay-1">
        {hero.heading}
      </h1>

      <p className="ph-hero-subtitle ph-animate-in ph-animate-delay-2">
        {hero.subtitle}
      </p>

      <div className="ph-hero-actions ph-animate-in ph-animate-delay-3">
        <Link to={hero.cta.href} className="ph-btn-primary">
          {hero.cta.label} <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to={hero.secondaryCta.href} className="ph-btn-ghost">
          {hero.secondaryCta.label}
        </Link>
      </div>

      <p className="ph-hero-trust ph-animate-in ph-animate-delay-4">
        {hero.trustText}
      </p>
    </section>
  );
}
