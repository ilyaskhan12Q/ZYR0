import { LegalPage, type LegalSection } from '@/components/legal/LegalPage';

const sections: LegalSection[] = [
  {
    id: 'about',
    title: 'About this policy',
    blocks: [
      {
        kind: 'p',
        text: 'ZYR0 is a product ecosystem for people who build, learn, research and work. Studio, School, Research, Work, ToolHub and the Blog all run on the same platform, and the internship program inside ZYR0 Work is one product within it. This policy explains what information we collect across those products, why we collect it, and the choices you have.',
      },
      {
        kind: 'p',
        text: 'It applies to zyroo.org and every ZYR0 subdomain. We keep the language plain on purpose. If anything is unclear, write to privacy@zyroo.org and we will explain it.',
      },
    ],
  },
  {
    id: 'collect',
    title: 'Information we collect',
    blocks: [
      {
        kind: 'list',
        items: [
          'Account details such as your name, email address, role, and the authentication data handled by our sign in provider.',
          'Profile details you choose to add, such as a photo, biography, skills, institution or company name, and links.',
          'Content you create or submit, including projects, tool and skill listings, documents, feedback, and certificates you earn.',
          'Activity data needed to run the products, such as applications, assigned tasks, reviews, and verification requests.',
          'Usage data such as pages visited, features used, device type, browser, and approximate location derived from your IP address.',
          'Messages you send to support or through the platform.',
          'Billing details when you buy a paid plan, which are processed by our payment provider rather than stored on our servers.',
        ],
      },
    ],
  },
  {
    id: 'use',
    title: 'How we use information',
    blocks: [
      {
        kind: 'list',
        items: [
          'To create and manage your account and give you access to the products you use.',
          'To run the features you ask for, from publishing a tool listing to applying for an internship and receiving a certificate.',
          'To send service messages, security alerts, and updates you have asked for.',
          'To keep the platform safe, detect abuse, and enforce our terms.',
          'To understand how the products are used and improve them.',
          'To meet legal, tax, and accounting obligations.',
        ],
      },
    ],
  },
  {
    id: 'legal-bases',
    title: 'Legal bases',
    blocks: [
      {
        kind: 'p',
        text: 'If you are in the European Economic Area or the United Kingdom, we rely on the following legal bases to process your information.',
      },
      {
        kind: 'ordered',
        items: [
          'Contract, when processing is needed to provide the products you signed up for.',
          'Legitimate interests, such as keeping the platform secure and improving it, where those interests are not overridden by your rights.',
          'Consent, for example for personalised advertising or optional analytics where the law requires it.',
          'Legal obligation, when we must keep or disclose information to comply with the law.',
        ],
      },
      {
        kind: 'p',
        text: 'Where we rely on consent, you can withdraw it at any time without affecting processing that already happened.',
      },
    ],
  },
  {
    id: 'sharing',
    title: 'Who we share with',
    blocks: [
      {
        kind: 'p',
        text: 'We do not sell personal information. We share it only with the providers that run the platform, and only as much as each one needs. These providers handle authentication and storage, hosting, network security, analytics, and advertising on public pages.',
      },
      {
        kind: 'list',
        items: [
          'Public content is visible by design. That includes company profiles, internship listings, published tools, blog posts, and the name on a verified certificate.',
          'We may disclose information when the law requires it, or when it is necessary to protect people and the platform.',
          'If ZYR0 is involved in a merger or acquisition, information may transfer as part of that deal and stays protected by this policy.',
        ],
      },
    ],
  },
  {
    id: 'advertising',
    title: 'Advertising and Google AdSense',
    blocks: [
      {
        kind: 'p',
        text: 'Some public pages show ads served by Google AdSense. Google and its partners use cookies and similar technologies to show ads based on your visits to this and other websites. Depending on your region and your consent choices, ads may be personalised or non personalised.',
      },
      {
        kind: 'p',
        text: 'You can control personalised advertising in Google Ads Settings at google.com/settings/ads, and opt out of participating vendors at aboutads.info. If you are in the EEA or the UK, you can change your consent choices at any time through the consent message on the site.',
      },
      {
        kind: 'callout',
        title: 'Why we show ads',
        text: 'Advertising helps keep the free parts of ZYR0 free. We do not give advertisers your name, email address, or account details.',
      },
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies and similar technologies',
    blocks: [
      {
        kind: 'p',
        text: 'We use cookies and similar storage for sign in sessions, preferences, security, analytics, and advertising. Our Cookie Policy at zyroo.org/cookies lists each category and the controls available to you.',
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    blocks: [
      {
        kind: 'p',
        text: 'We use PostHog to understand how the products are used, and Cloudflare to understand traffic and performance. These tools collect technical and aggregated data, not the contents of your account. You can limit analytics through your browser settings or the consent controls where they apply.',
      },
    ],
  },
  {
    id: 'retention',
    title: 'Data retention',
    blocks: [
      {
        kind: 'p',
        text: 'We keep account and product data while your account is active, and for a reasonable period afterwards where we need it for legal, security, or accounting reasons. When data is no longer needed, we delete or anonymise it. You can ask us to delete your account at any time.',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    blocks: [
      {
        kind: 'list',
        items: [
          'All traffic is encrypted in transit with HTTPS and modern TLS.',
          'Authentication is handled by Supabase Auth, including sign in with Google and LinkedIn.',
          'Database access is restricted with row level security, so people only reach data they are allowed to see.',
          'We review access and practices regularly and welcome responsible disclosure.',
        ],
      },
      {
        kind: 'p',
        text: 'No method of transmission or storage is completely secure. Use a strong password and enable two factor authentication where we offer it.',
      },
    ],
  },
  {
    id: 'rights',
    title: 'Your rights',
    blocks: [
      {
        kind: 'list',
        items: [
          'Access the personal information we hold about you.',
          'Correct information that is wrong or incomplete.',
          'Delete your account and the data attached to it.',
          'Export your data in a portable format.',
          'Object to or restrict certain processing.',
          'Withdraw consent where we rely on it.',
        ],
      },
      {
        kind: 'p',
        text: 'To make a request, write to privacy@zyroo.org. We respond within 30 days. If you are in the EEA or the UK, you also have the right to complain to your local data protection authority.',
      },
    ],
  },
  {
    id: 'children',
    title: 'Children',
    blocks: [
      {
        kind: 'p',
        text: 'ZYR0 is meant for people aged 16 and over. We do not knowingly collect information from children under 16. If you believe a child has created an account, contact us and we will remove it.',
      },
    ],
  },
  {
    id: 'transfers',
    title: 'International transfers',
    blocks: [
      {
        kind: 'p',
        text: 'ZYR0 serves users in many countries, and our providers may process data outside your country. When data leaves the EEA or the UK, we rely on appropriate safeguards such as standard contractual clauses.',
      },
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    blocks: [
      {
        kind: 'p',
        text: 'We update this policy when our products or the law change. The date at the top always shows the current version. For significant changes we will notify you by email or with a notice on the platform.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    blocks: [
      {
        kind: 'p',
        text: 'Privacy questions: privacy@zyroo.org. General support: support@zyroo.org. You can also reach us through the Contact page.',
      },
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      summary="What we collect across Studio, School, Research, Work, ToolHub and the Blog, why we collect it, and the choices you have."
      path="/privacy"
      metaTitle="Privacy Policy"
      metaDescription="How ZYR0 collects, uses and protects your information across Studio, School, Research, Work, ToolHub and the Blog."
      keywords="ZYR0 privacy policy, data protection, GDPR, advertising cookies, AdSense privacy"
      updated="24 November 2026"
      sections={sections}
    />
  );
}
