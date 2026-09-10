import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const products = [
  {
    label: 'Internships',
    description: 'Find and manage structured internships with verified companies.',
    href: '/internships/browse',
    logo: null,
  },
  {
    label: 'Research Agent',
    description: 'AI-powered deep research for papers, reports, and analysis.',
    href: '/research',
    logo: '/logos/research.png',
  },
  {
    label: 'ZYR0 Edu',
    description: 'Modern operating system for schools and colleges.',
    href: '/school',
    logo: '/logos/schoolOS.png',
  },
  {
    label: 'ZYRO Studio',
    description: 'Website builder — launch your portfolio in minutes.',
    href: '/studio',
    logo: '/logos/studio.png',
    badge: 'Coming Soon',
  },
];

export default function ProductsDropdown({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
          scrolled
            ? 'text-foreground/90 hover:text-foreground'
            : 'text-slate-900/90 dark:text-white/90 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        Products
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[340px] sm:w-[380px] bg-card backdrop-blur-xl rounded-xl border border-border shadow-xl p-2 z-50"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent rounded-t-xl" />
            {products.map((product) => (
              <Link
                key={product.href}
                to={product.href}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/60 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-muted ring-1 ring-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                  {product.logo ? (
                    <img src={product.logo} alt={product.label} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-sm text-muted-foreground">{product.label.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                      {product.label}
                    </span>
                    {product.badge && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {product.description}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 mt-1 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
