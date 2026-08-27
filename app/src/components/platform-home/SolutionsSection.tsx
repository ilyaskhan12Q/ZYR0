import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { ecosystemSolutions } from './data';

export default function SolutionsSection() {
  return (
    <section id="solutions" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          Tailored Solutions
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-4">
          Built for Every Step of the Lifecycle
        </h2>
        <p className="text-sm sm:text-base text-neutral-400">
          From first prototype to school management, academic research, and workforce entry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ecosystemSolutions.map((solution) => {
          const Icon = solution.icon;
          return (
            <div
              key={solution.category}
              className="p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                    {solution.category}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-mono mb-2">
                  {solution.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                  {solution.description}
                </p>
              </div>

              <Link
                to={solution.href}
                className="inline-flex items-center gap-2 text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors"
              >
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
