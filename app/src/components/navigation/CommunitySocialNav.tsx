import React from 'react';
import { toast } from 'sonner';
import { SITE_CONFIG } from '@/config/site';

interface CommunitySocialNavProps {
  scrolled?: boolean;
  mobile?: boolean;
  className?: string;
}

export const CommunitySocialNav: React.FC<CommunitySocialNavProps> = ({
  scrolled = false,
  mobile = false,
  className = '',
}) => {
  const whatsappUrl = SITE_CONFIG.social.whatsappChannel;
  const linkedinUrl = SITE_CONFIG.social.linkedinCompany;

  const handleLinkedInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (linkedinUrl) {
      window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('LinkedIn Community channel is coming soon!', {
        description: 'Join our WhatsApp Channel for instant internship alerts and official updates.',
      });
    }
  };

  if (mobile) {
    return (
      <div className={`space-y-2 py-2 ${className}`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 mb-2">
          Official Community
        </p>

        {/* WhatsApp Channel (Mobile) */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow ZYR0 WhatsApp Channel for instant updates"
          className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/20 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">WhatsApp Channel</span>
              <span className="text-xs text-emerald-700/80 dark:text-emerald-400/80">Instant internship & platform alerts</span>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider shadow-sm">
            Join
          </span>
        </a>

        {/* LinkedIn Placeholder (Mobile) */}
        <button
          onClick={handleLinkedInClick}
          aria-label="LinkedIn Community Channel (Coming Soon)"
          className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-border/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </div>
            <span className="font-medium text-foreground/80">LinkedIn Page</span>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/40">
            Coming Soon
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* WhatsApp Channel CTA Button (Desktop) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Join ZYR0 WhatsApp Channel for instant announcements & internship alerts"
        aria-label="Join ZYR0 WhatsApp Channel"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border shadow-xs group ${
          scrolled
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30 hover:border-emerald-400/60'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <svg className="w-3.5 h-3.5 fill-current shrink-0 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
        </svg>
        <span className="hidden sm:inline">WhatsApp Channel</span>
      </a>

      {/* LinkedIn Placeholder Button (Desktop) */}
      <button
        onClick={handleLinkedInClick}
        title="LinkedIn Community Page (Coming Soon)"
        aria-label="LinkedIn Community Channel (Coming Soon)"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border opacity-75 hover:opacity-100 ${
          scrolled
            ? 'bg-muted/60 text-muted-foreground border-border/50 hover:bg-muted'
            : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
        }`}
      >
        <svg className="w-3.5 h-3.5 fill-current shrink-0 text-blue-500 dark:text-blue-400" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
        <span className="hidden xl:inline text-[11px]">LinkedIn</span>
        <span className="text-[10px] text-muted-foreground/80 font-normal ml-0.5">(Soon)</span>
      </button>
    </div>
  );
};
