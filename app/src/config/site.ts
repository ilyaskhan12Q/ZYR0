const runtimeUrl = import.meta.env.VITE_SITE_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'https://zyroo.dpdns.org');

const cleanUrl = runtimeUrl.replace(/\/+$/, '');

export const SITE_CONFIG = {
  name: 'ZYR0',
  url: cleanUrl,
  defaultImage: `${cleanUrl}/og-image.png`,
  twitterHandle: '@zyr0platform',
  supportEmail: 'support@zyr0.com'
};
