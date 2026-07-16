const runtimeUrl = import.meta.env.VITE_SITE_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'https://zyroo.dpdns.org');

const cleanUrl = runtimeUrl.replace(/\/+$/, '');

export const SITE_CONFIG = {
  name: 'Zyro',
  url: cleanUrl,
  defaultImage: `${cleanUrl}/og-image.png`,
  twitterHandle: '@zyroplatform',
  supportEmail: 'support@zyro.com'
};
