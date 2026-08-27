import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code, School, BrainCircuit, Briefcase,
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2,
  Zap, Layers, ChevronRight
} from 'lucide-react';
import { productsList } from './data';

export default function HeroSection() {
  const [activePill, setActivePill] = useState('studio');

  const selectedProduct = productsList.find((p) => p.id === activePill) || productsList[0];
  const IconComponent = selectedProduct.icon;

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[350px] sm:h-[450px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/15 to-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-8 backdrop-blur-md hover:border-white/20 transition-all">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-white font-semibold font-mono">ZYR0 2.0</span>
          <span className="text-neutral-500">•</span>
          <span>The Multi-Product AI & SaaS Ecosystem</span>
          <ArrowRight className="w-3 h-3 text-cyan-400" />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-mono max-w-5xl mx-auto leading-[1.1] mb-6">
          Build, Learn, Research, <br className="hidden sm:inline" />
          and Work with{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            Autonomous AI.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-neutral-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          From prompt-to-app web development and K-12 school operating systems to deep research agents and verified internship proof-of-work.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm tracking-wide transition-all shadow-xl shadow-white/10 hover:shadow-white/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#products-suite"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/15 transition-all flex items-center justify-center gap-2"
          >
            <span>Explore All 4 Products</span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </a>
        </div>

        {/* Product Quick-Switcher Tabs */}
        <div className="max-w-4xl mx-auto bg-neutral-950/80 border border-white/10 rounded-2xl p-2 sm:p-3 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-4">
            {productsList.map((product) => {
              const Icon = product.icon;
              const isActive = activePill === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setActivePill(product.id)}
                  className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-white/10 border border-white/15 text-white shadow-lg'
                      : 'hover:bg-white/5 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5"
                    style={{ color: product.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold">{product.name}</div>
                    <div className="text-[10px] text-neutral-500 truncate">{product.badge}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Product Highlight Card */}
          <div className="p-4 sm:p-6 rounded-xl bg-neutral-900/90 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/10"
                style={{ color: selectedProduct.color }}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base font-bold text-white font-mono">
                    {selectedProduct.name}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-medium">
                    {selectedProduct.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 mb-2">
                  {selectedProduct.headline}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400">
                  {selectedProduct.features.slice(0, 2).map((feat) => (
                    <span key={feat} className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to={selectedProduct.href}
              className="flex-shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>Explore {selectedProduct.name.replace('ZYR0 ', '')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
