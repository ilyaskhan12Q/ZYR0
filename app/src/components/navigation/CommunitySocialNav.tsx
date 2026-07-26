import React from 'react';
import { toast } from 'sonner';
import { SITE_CONFIG } from '@/config/site';
import { WhatsAppIcon, LinkedInIcon } from '@/components/icons/BrandIcons';

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
          className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/20 group shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <WhatsAppIcon className="w-4 h-4 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-emerald-950 dark:text-emerald-200">WhatsApp Channel</span>
              <span className="text-xs text-emerald-700/80 dark:text-emerald-400/80">Instant internship & platform alerts</span>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider shadow-xs">
            Join
          </span>
        </a>

        {/* LinkedIn Placeholder (Mobile) */}
        <button
          onClick={handleLinkedInClick}
          aria-label="LinkedIn Community Channel (Coming Soon)"
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-border/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-600/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <LinkedInIcon className="w-4 h-4 fill-current" />
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
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50'
            : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30 hover:border-emerald-400/60'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <WhatsAppIcon className="w-3.5 h-3.5 fill-current shrink-0 group-hover:scale-110 transition-transform duration-200" />
        <span className="hidden sm:inline">WhatsApp Channel</span>
      </a>

      {/* LinkedIn Placeholder Button (Desktop) */}
      <button
        onClick={handleLinkedInClick}
        title="LinkedIn Community Page (Coming Soon)"
        aria-label="LinkedIn Community Channel (Coming Soon)"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border opacity-80 hover:opacity-100 ${
          scrolled
            ? 'bg-muted/60 text-muted-foreground border-border/50 hover:bg-muted'
            : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
        }`}
      >
        <LinkedInIcon className="w-3.5 h-3.5 fill-current shrink-0 text-blue-600 dark:text-blue-400" />
        <span className="hidden xl:inline text-[11px]">LinkedIn</span>
        <span className="text-[10px] text-muted-foreground/80 font-normal ml-0.5">(Soon)</span>
      </button>
    </div>
  );
};
