import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown, Menu, X, Sparkles, Code, School,
  BrainCircuit, Briefcase, ArrowRight, ExternalLink
} from 'lucide-react';
import { productsList } from './data';

export default function PlatformNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProductsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsProductsOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 border ${
          isScrolled
            ? 'bg-black/85 backdrop-blur-xl border-white/15 shadow-2xl shadow-black/80 py-3 px-5 sm:px-6'
            : 'bg-black/60 backdrop-blur-md border-white/10 py-3.5 px-5 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 via-cyan-500 to-indigo-600 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
                <span className="text-white font-bold text-sm tracking-wider font-mono">Z0</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white font-mono flex items-center gap-1.5">
                ZYR0
                <span className="px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider bg-white/10 text-emerald-400 border border-emerald-500/20 rounded">
                  SaaS Suite
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Products Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                  isProductsOpen
                    ? 'text-white bg-white/10'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
                aria-expanded={isProductsOpen}
              >
                <span>Products</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isProductsOpen ? 'rotate-180 text-cyan-400' : 'text-neutral-400'
                  }`}
                />
              </button>

              {/* Mega-Dropdown Menu */}
              {isProductsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[560px] p-3 rounded-2xl bg-neutral-950/95 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-black/90 grid grid-cols-2 gap-2 animate-in fade-in zoom-in-95 duration-150">
                  {productsList.map((product) => {
                    const Icon = product.icon;
                    return (
                      <Link
                        key={product.id}
                        to={product.href}
                        onClick={() => setIsProductsOpen(false)}
                        className="group flex flex-col p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-105 transition-transform"
                              style={{ color: product.color }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors">
                              {product.name}
                            </span>
                          </div>
                          {product.badge && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/10">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </Link>
                    );
                  })}
                  <div className="col-span-2 mt-1 pt-2 border-t border-white/10 px-2 flex items-center justify-between text-xs text-neutral-400">
                    <span>Explore all ecosystem tools & integrations</span>
                    <a
                      href="#products-suite"
                      onClick={() => setIsProductsOpen(false)}
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      Compare all products <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#solutions"
              className="px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Solutions
            </a>
            <a
              href="#pricing"
              className="px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Pricing
            </a>
            <Link
              to="/about"
              className="px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-md shadow-white/10 hover:shadow-white/20 active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-300 hover:text-white rounded-lg bg-white/5 border border-white/10"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-1">
              Products
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {productsList.map((product) => {
                const Icon = product.icon;
                return (
                  <Link
                    key={product.id}
                    to={product.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/15"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5"
                        style={{ color: product.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{product.name}</div>
                        <div className="text-[11px] text-neutral-400">{product.badge}</div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 -rotate-90 text-neutral-500" />
                  </Link>
                );
              })}
            </div>

            <div className="h-[1px] bg-white/10 my-1" />

            <div className="flex flex-col gap-1 text-sm font-medium text-neutral-300">
              <a
                href="#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-2 hover:text-white"
              >
                Solutions
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-2 hover:text-white"
              >
                Pricing
              </a>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-2 hover:text-white"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-2 hover:text-white"
              >
                Contact
              </Link>
            </div>

            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 w-full py-2.5 text-center text-sm font-semibold text-black bg-white rounded-xl shadow-lg"
            >
              Get Started Free
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
