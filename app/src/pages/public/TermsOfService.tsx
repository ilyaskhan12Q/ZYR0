import { LegalPage, type LegalSection } from '@/components/legal/LegalPage';

const sections: LegalSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of these terms',
    blocks: [
      {
        kind: 'p',
        text: 'These terms govern your use of zyroo.org and every ZYR0 subdomain, including Studio, School, Research, Work, ToolHub and the Blog. By creating an account or using any of those products, you agree to these terms and to our Privacy Policy and Cookie Policy.',
      },
      {
        kind: 'p',
        text: 'If you do not agree, please do not use the platform. If you use ZYR0 for an organisation, you confirm that you are allowed to accept these terms on its behalf.',
      },
    ],
  },
  {
    id: 'accounts',
    title: 'Accounts',
    blocks: [
      {
        kind: 'list',
        items: [
          'You must be at least 16 years old to create an account.',
          'You agree to provide accurate information and keep it up to date.',
          'You are responsible for your password and for activity under your account. Tell us right away if you suspect unauthorised access.',
          'One person or organisation should hold one account per role. Do not create accounts to avoid limits or bans.',
          'We may ask you to verify your email or identity before enabling certain features.',
        ],
      },
    ],
  },
  {
    id: 'products',
    title: 'The products and how they change',
    blocks: [
      {
        kind: 'p',
        text: 'ZYR0 is a growing ecosystem, so products are added, improved and sometimes retired. We may change or remove features, and we may move a feature between products. When a change materially affects paid features, we will give reasonable notice.',
      },
      {
        kind: 'list',
        items: [
          'Free features are provided as they are, without a guarantee of uptime or of permanent availability.',
          'Beta or preview features may be incomplete and can change without notice.',
          'We may set fair use limits to keep the platform stable for everyone.',
        ],
      },
    ],
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    blocks: [
      {
        kind: 'p',
        text: 'Use ZYR0 for its intended purpose and treat other people with respect. You agree not to do any of the following.',
      },
      {
        kind: 'list',
        items: [
          'Break the law, infringe someone else, or help others do so.',
          'Harass, threaten, discriminate against, or impersonate another person.',
          'Upload malware, spam, or content that is deliberately misleading.',
          'Scrape, crawl, or extract data with automated tools except where we allow it in writing or through a public API.',
          'Reverse engineer, probe, or attempt to bypass security, rate limits, or access controls.',
          'Sell, rent, or transfer your account without our permission.',
          'Use the platform to send unsolicited commercial messages.',
        ],
      },
    ],
  },
  {
    id: 'content',
    title: 'Your content',
    blocks: [
      {
        kind: 'p',
        text: 'You keep ownership of the content you create on ZYR0, including projects, listings, posts, and profile details. You give us a non exclusive licence to host, display, and share that content as needed to run the products you use.',
      },
      {
        kind: 'list',
        items: [
          'You confirm that you have the rights to everything you upload.',
          'Public content, such as published tools, blog posts, company profiles, and certificates, can be seen and shared by anyone.',
          'We may remove content that breaks these terms, the law, or the rights of others.',
          'If you delete content, some copies may remain for a short time in backups or where the law requires retention.',
        ],
      },
    ],
  },
  {
    id: 'work',
    title: 'ZYR0 Work and internships',
    blocks: [
      {
        kind: 'p',
        text: 'ZYR0 Work connects students, companies, and mentors, and helps teams run internship programs. It is one product inside the ecosystem, not an employment agency.',
      },
      {
        kind: 'list',
        items: [
          'Companies are responsible for the accuracy of their listings, including scope, duration, compensation, and requirements.',
          'Students are responsible for the work they submit and for the repositories they link.',
          'A certificate confirms that a program was completed on ZYR0. It is not a guarantee of skill, employment, or an offer.',
          'We do not guarantee that an application leads to an offer, or that a listing stays open for any length of time.',
          'Any arrangement between a student and a company is between those parties. ZYR0 is not a party to it.',
        ],
      },
    ],
  },
  {
    id: 'tools',
    title: 'ToolHub listings',
    blocks: [
      {
        kind: 'p',
        text: 'ToolHub collects tools, skills, and resources from ZYR0 and from public sources such as GitHub and Hugging Face. Listings are for discovery, and a listing is not an endorsement.',
      },
      {
        kind: 'list',
        items: [
          'Always check the licence and the source of a tool before you use it in your own work.',
          'We are not responsible for third party code, its security, or its behaviour on your machine.',
          'If you submit a listing, you confirm that the information is accurate and that you are allowed to share it.',
        ],
      },
    ],
  },
  {
    id: 'payments',
    title: 'Paid plans and billing',
    blocks: [
      {
        kind: 'p',
        text: 'Some features are paid. Prices, billing periods, and what each plan includes are shown before you buy. Payments are handled by our payment provider, and by buying a plan you also accept their terms.',
      },
      {
        kind: 'list',
        items: [
          'Subscriptions renew automatically until you cancel, unless the checkout says otherwise.',
          'You can cancel at any time, and access continues until the end of the paid period.',
          'Refunds are handled case by case where the law requires them or where we state otherwise on the checkout page.',
          'You are responsible for any taxes that apply to your purchase.',
          'If a payment fails, we may suspend paid features until it is resolved.',
        ],
      },
    ],
  },
  {
    id: 'ip',
    title: 'Intellectual property',
    blocks: [
      {
        kind: 'list',
        items: [
          'ZYR0 owns the platform, its design, branding, documentation, and the certificate system.',
          'Your project work stays yours unless you agree otherwise with a company or client.',
          'You may not copy or reuse our branding without written permission.',
          'If you send us feedback or ideas, we may use them without restriction or payment.',
        ],
      },
    ],
  },
  {
    id: 'third-parties',
    title: 'Third party services and links',
    blocks: [
      {
        kind: 'p',
        text: 'ZYR0 links to and integrates with services we do not control, such as GitHub, Google, LinkedIn, and external tool sources. Their terms and privacy policies apply when you use them, and we are not responsible for their content or availability.',
      },
    ],
  },
  {
    id: 'ads',
    title: 'Advertising',
    blocks: [
      {
        kind: 'p',
        text: 'Some public pages show ads through Google AdSense to keep free access possible. Ads are labelled, and we do not give advertisers your account details. See our Privacy Policy and Cookie Policy for how advertising data works and how to control it.',
      },
    ],
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    blocks: [
      {
        kind: 'p',
        text: 'The products are provided as they are and as available, without warranties of any kind, whether express or implied. We do not promise that the platform will be uninterrupted, error free, or fit for a particular purpose.',
      },
    ],
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    blocks: [
      {
        kind: 'p',
        text: 'To the fullest extent allowed by law, ZYR0 is not liable for indirect, incidental, special, or consequential losses, or for lost profits, data, or opportunities. Our total liability for a claim is limited to the amount you paid us in the twelve months before the claim, or one hundred US dollars if you use only free features.',
      },
      {
        kind: 'p',
        text: 'Nothing here limits liability that cannot be limited by law.',
      },
    ],
  },
  {
    id: 'termination',
    title: 'Suspension and termination',
    blocks: [
      {
        kind: 'list',
        items: [
          'You can stop using ZYR0 at any time and ask us to delete your account.',
          'We may suspend or close an account that breaks these terms, poses a security risk, or is used for fraud or abuse.',
          'Where it is reasonable, we will tell you why before or after taking action.',
          'Certificates already issued stay verifiable through the public verification page.',
        ],
      },
    ],
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    blocks: [
      {
        kind: 'p',
        text: 'We update these terms when the products or the law change. The date at the top shows the current version. For significant changes we will notify you by email or with a notice on the platform. Continuing to use ZYR0 after a change means you accept the updated terms.',
      },
    ],
  },
  {
    id: 'law',
    title: 'Governing law',
    blocks: [
      {
        kind: 'p',
        text: 'These terms are governed by the applicable laws of the country where ZYR0 operates, without regard to conflict of law rules. Before starting formal proceedings, both sides agree to try to resolve the issue in good faith.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    blocks: [
      {
        kind: 'p',
        text: 'For questions about these terms or a legal request, write to legal@zyroo.org. For general help, use the Help Center or write to support@zyroo.org.',
      },
    ],
  },
];

export default function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      summary="The rules for using ZYR0 across Studio, School, Research, Work, ToolHub and the Blog."
      path="/terms"
      metaTitle="Terms of Service"
      metaDescription="The terms that govern your use of ZYR0 across Studio, School, Research, Work, ToolHub, and the Blog."
      keywords="ZYR0 terms of service, platform agreement, user terms, acceptable use"
      updated="24 November 2026"
      sections={sections}
      contactNote="Questions about these terms?"
      contactEmail="legal@zyroo.org"
    />
  );
}
