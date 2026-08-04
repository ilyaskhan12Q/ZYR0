import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, TriangleAlert } from 'lucide-react';
import { getActiveSiteBanner } from '@/services/siteBanners';
import { SITE_CONFIG } from '@/config/site';
import { WhatsAppIcon } from '@/components/icons/BrandIcons';
import type { SiteBanner } from '@/lib/database.types';

const DISMISS_PREFIX = 'zyr0-banner-dismissed';

function isDismissed(id: string) {
  try {
    return localStorage.getItem(`${DISMISS_PREFIX}-${id}`) === 'true';
  } catch {
    return false;
  }
}

function markDismissed(id: string) {
  try {
    localStorage.setItem(`${DISMISS_PREFIX}-${id}`, 'true');
  } catch {
    /* ignore */
  }
}

interface SiteBannerBarProps {
  onVisibilityChange: (visible: boolean) => void;
}

export function SiteBannerBar({ onVisibilityChange }: SiteBannerBarProps) {
  const [banner, setBanner] = useState<SiteBanner | null>(null);

  useEffect(() => {
    let cancelled = false;
    getActiveSiteBanner().then((result) => {
      if (cancelled) return;
      const visible = result !== null && !isDismissed(result.id);
      setBanner(visible ? result : null);
      onVisibilityChange(visible);
    });
    return () => {
      cancelled = true;
    };
  }, [onVisibilityChange]);

  const dismiss = () => {
    if (banner) markDismissed(banner.id);
    setBanner(null);
    onVisibilityChange(false);
  };

  const linkUrl = banner?.link_url ?? SITE_CONFIG.social.whatsappSupportGroup;
  const linkLabel = banner?.link_label ?? 'Contact us';
  const linkIsWhatsApp = linkUrl === SITE_CONFIG.social.whatsappSupportGroup;

  return (
    <AnimatePresence>
      {banner && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-center gap-3">
              <TriangleAlert className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <p className="text-xs sm:text-sm font-medium text-center leading-tight truncate">
                <span className="font-semibold">{banner.title}: </span>
                {banner.message}
              </p>
              <a
                href={linkUrl}
                target={linkUrl.startsWith('http') ? '_blank' : undefined}
                rel={linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-50 text-xs font-semibold hover:bg-amber-900 transition-colors flex-shrink-0"
              >
                {linkIsWhatsApp && <WhatsAppIcon className="w-3 h-3 fill-current" />}
                {linkLabel}
              </a>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss notice"
                className="flex-shrink-0 p-1 rounded-md hover:bg-amber-950/15 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}