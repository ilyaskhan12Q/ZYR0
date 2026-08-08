import { useEffect, useState } from 'react';
import { Search, ArrowRight, Zap, MapPin } from 'lucide-react';

const ROLES = [
  'Frontend Developer Intern',
  'AI/ML Intern',
  'UI/UX Design Intern',
  'Data Analyst Intern',
  'Content Writer Intern',
];

const PLACES = ['Remote', 'Lahore', 'Karachi', 'Islamabad', 'Hybrid'];

export default function AnimatedSearchMockup() {
  const [typed, setTyped] = useState('');
  const [placeIdx, setPlaceIdx] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setTyped(ROLES[0]);
      return;
    }

    let role = 0;
    let char = 0;
    let deleting = false;

    const timer = window.setInterval(() => {
      const text = ROLES[role];
      if (!deleting) {
        char += 1;
        setTyped(text.slice(0, char));
        if (char === text.length) {
          deleting = true;
          char += 1; // extra tick to hold
        }
      } else {
        char -= 1;
        if (char <= 0) {
          deleting = false;
          role = (role + 1) % ROLES.length;
          setTyped('');
          return;
        }
        setTyped(text.slice(0, char));
      }
    }, 55);

    const placeTimer = window.setInterval(() => {
      setPlaceIdx(i => (i + 1) % PLACES.length);
    }, 2200);

    return () => {
      window.clearInterval(timer);
      window.clearInterval(placeTimer);
    };
  }, []);

  return (
    <div className="relative w-full max-w-md">
      {/* Floating "Hiring Now" badge */}
      <div className="absolute -top-5 -left-3 sm:-left-6 z-20 flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/15 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-xl px-3.5 py-1.5 shadow-xl">
        <span className="v3-pulse-dot w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-label text-[9px] text-emerald-300">Hiring Now</span>
      </div>

      {/* Search panel */}
      <div className="glass-card-v3 relative z-10 p-5 sm:p-6 text-slate-900 dark:text-white">
        <div className="flex items-center justify-between">
          <span className="font-label text-[9px] text-slate-500 dark:text-slate-400">
            Explore Internships
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
            <Zap className="w-3 h-3 text-amber-500" />
            Live feed
          </span>
        </div>

        {/* Search input mock */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-white/15 bg-white/80 dark:bg-slate-900/80 px-4 py-3.5">
          <Search className="w-4.5 h-4.5 shrink-0 text-blue-600 dark:text-sky-400" />
          <span className="truncate text-sm font-medium text-slate-600 dark:text-slate-200">
            {typed}
            <span className="ml-0.5 inline-block w-0.5 h-4 bg-sky-400 align-middle animate-pulse" />
          </span>
        </div>

        {/* Rotating city chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {PLACES.map((place, i) => (
            <span
              key={place}
              className={`chip-v3 transition-all duration-300 ${
                i === placeIdx
                  ? 'border-sky-400/50 bg-sky-400/10 text-sky-300'
                  : 'border-white/10 text-slate-500 dark:text-slate-400'
              }`}
            >
              <MapPin className="w-3 h-3" />
              {place}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-display font-semibold text-slate-900 dark:text-white text-sm shadow-lg shadow-blue-600/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Find Internships
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="mt-3 text-center text-[10px] text-slate-500 dark:text-slate-400">
          Live internships · Updated 2 min ago
        </p>
      </div>

      {/* Floating accepted badge */}
      <div className="absolute -bottom-5 -right-3 sm:-right-6 z-20 flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/15 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-xl px-3.5 py-1.5 shadow-xl">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="font-label text-[9px] text-amber-300">Stipend Paid</span>
      </div>
    </div>
  );
}
