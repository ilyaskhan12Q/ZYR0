import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { stats } from './data';

export default function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
      <div className="relative rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-white/15 p-8 sm:p-14 overflow-hidden text-center shadow-2xl">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-6 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Join the Next Generation of Builders
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-mono mb-6 leading-tight">
            Ready to experience the future of SaaS & AI?
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create web apps in seconds, modernize institutional operations, automate deep research, and build verifiable proof of engineering excellence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm tracking-wide transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/15 transition-all flex items-center justify-center gap-2"
            >
              <span>Book Institutional Demo</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{stat.number}</div>
                <div className="text-xs text-neutral-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
