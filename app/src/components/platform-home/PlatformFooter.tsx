import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code, School, BrainCircuit, Briefcase,
  ShieldCheck, ArrowUpRight, Heart, Globe
} from 'lucide-react';
import { footerNav } from './data';

export default function PlatformFooter() {
  return (
    <footer className="w-full bg-neutral-950 border-t border-white/10 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-neutral-400">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 via-cyan-500 to-indigo-600 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
                  <span className="text-white font-bold text-sm font-mono">Z0</span>
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-mono">
                ZYR0
              </span>
            </Link>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              The unified AI & SaaS ecosystem power-charging builders with Studio, institutions with School OS, researchers with 0-AI, and talent with verified work experience.
            </p>

            {/* System Status */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems & API Nodes Operational</span>
            </div>

            {/* Official Support */}
            <a
              href="mailto:support@zyroo.org"
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Direct Support: <span className="text-neutral-200 underline">support@zyroo.org</span>
            </a>
          </div>

          {/* Products Col */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Products
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {footerNav.products.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Col */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Solutions
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {footerNav.solutions.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Col */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Company
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {footerNav.company.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Col */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Legal & Trust
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {footerNav.legal.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} ZYR0 Co. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a
              href="https://linkedin.com/company/zyr0-co"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-300 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-300 transition-colors"
            >
              X (Twitter)
            </a>
            <a
              href="https://whatsapp.com/channel/0029Vb8m3OK5Ui2W8xNLgy0F"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-300 transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="https://github.com/ilyaskhan12Q/ZYR0"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
