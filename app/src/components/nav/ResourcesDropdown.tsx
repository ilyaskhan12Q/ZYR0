import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, FileText, BookOpen, MessageCircle, Shield, BadgeCheck, Cookie, ChevronRight } from 'lucide-react';

const resources = [
  { label: 'Help Center', href: '/help', icon: HelpCircle },
  { label: 'FAQ', href: '/faq', icon: MessageCircle },
  { label: 'Verify Certificate', href: '/verify', icon: BadgeCheck },
  { label: 'Blog', href: '/blog', icon: BookOpen, badge: 'Soon' },
  { label: 'Privacy Policy', href: '/privacy', icon: Shield },
  { label: 'Terms of Service', href: '/terms', icon: FileText },
  { label: 'Cookie Policy', href: '/cookie', icon: Cookie },
];

export default function ResourcesDropdown({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false);
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
        Resources
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
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-[240px] bg-card/80 dark:bg-card/90 backdrop-blur-xl rounded-xl border border-border/50 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.4)] py-1.5 z-50"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent rounded-t-xl" />
            {resources.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/60 transition-all group mx-1 rounded-lg"
              >
                <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
