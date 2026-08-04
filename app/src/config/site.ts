const runtimeUrl = import.meta.env.VITE_SITE_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'https://zyroo.dpdns.org');

const cleanUrl = runtimeUrl.replace(/\/+$/, '');

export const SITE_CONFIG = {
  name: 'ZYR0',
  url: cleanUrl,
  defaultImage: `${cleanUrl}/og-image.png`,
  twitterHandle: '@zyr0platform',
  supportEmail: 'support@zyroo.dpdns.org',
  social: {
    whatsappChannel: import.meta.env.VITE_WHATSAPP_CHANNEL_URL || 'https://whatsapp.com/channel/0029Vb8m3OK5Ui2W8xNLgy0F',
    whatsappSupportGroup: import.meta.env.VITE_WHATSAPP_SUPPORT_GROUP_URL || 'https://chat.whatsapp.com/Hp2rnX1B61PDzVlbF89Tha',
    linkedinCompany: import.meta.env.VITE_LINKEDIN_COMPANY_URL || 'https://linkedin.com/company/zyr0-co',
  }
};
