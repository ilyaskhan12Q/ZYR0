import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Building2, Mail, Briefcase, BadgeCheck, ChevronRight } from 'lucide-react';

const company = [
  { label: 'About', href: '/about', icon: Building2 },
  { label: 'Contact', href: '/contact', icon: Mail },
  { label: 'Careers', href: '/careers', icon: Briefcase },
  { label: 'Verify Certificate', href: '/verify', icon: BadgeCheck },
];

export default function CompanyDropdown({ scrolled }: { scrolled: boolean }) {
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
        Company
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
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[220px] bg-card backdrop-blur-xl rounded-xl border border-border shadow-xl py-1.5 z-50"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent rounded-t-xl" />
            {company.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/60 transition-all group mx-1 rounded-lg"
              >
                <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
