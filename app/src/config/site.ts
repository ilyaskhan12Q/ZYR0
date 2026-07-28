const runtimeUrl = import.meta.env.VITE_SITE_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'https://zyroo.dpdns.org');

const cleanUrl = runtimeUrl.replace(/\/+$/, '');

export const SITE_CONFIG = {
  name: 'ZYR0',
  url: cleanUrl,
  defaultImage: `${cleanUrl}/og-image.png`,
  twitterHandle: '@zyr0platform',
  supportEmail: 'support@zyr0.com',
  social: {
    whatsappChannel: import.meta.env.VITE_WHATSAPP_CHANNEL_URL || 'https://whatsapp.com/channel/0029Vb8m3OK5Ui2W8xNLgy0F',
    linkedinCompany: import.meta.env.VITE_LINKEDIN_COMPANY_URL || 'https://linkedin.com/company/zyr0-co',
  }
};
