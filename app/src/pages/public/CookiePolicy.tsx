import { LegalPage, type LegalSection } from '@/components/legal/LegalPage';

const sections: LegalSection[] = [
  {
    id: 'about',
    title: 'About this policy',
    blocks: [
      {
        kind: 'p',
        text: 'Cookies are small files a site stores in your browser. We also use local storage and similar technologies to keep you signed in, remember preferences, understand how the products are used, and show ads on public pages.',
      },
      {
        kind: 'p',
        text: 'This policy covers zyroo.org and every ZYR0 subdomain, including Studio, School, Research, Work, ToolHub and the Blog. It should be read together with our Privacy Policy.',
      },
    ],
  },
  {
    id: 'categories',
    title: 'The categories we use',
    blocks: [
      {
        kind: 'table',
        headers: ['Category', 'What it does', 'Required'],
        rows: [
          ['Strictly necessary', 'Sign in, session security, fraud prevention, and remembering your cookie choices.', 'Yes'],
          ['Preferences', 'Remembers settings such as theme and layout so the interface feels the same next time.', 'No'],
          ['Analytics', 'Helps us see which pages and features are used and where things break.', 'No'],
          ['Advertising', 'Lets Google and its partners show and measure ads on public pages.', 'No'],
        ],
      },
      {
        kind: 'p',
        text: 'Strictly necessary cookies are needed for the platform to work. The others are optional, and where the law requires consent we ask before setting them.',
      },
    ],
  },
  {
    id: 'cookies-we-use',
    title: 'Cookies you may see',
    blocks: [
      {
        kind: 'p',
        text: 'The exact names can change as we update providers, but these are the ones you are most likely to find.',
      },
      {
        kind: 'table',
        headers: ['Name', 'Set by', 'Purpose', 'Duration'],
        rows: [
          ['sb-*-auth-token', 'Supabase', 'Keeps you signed in and refreshes your session securely.', 'Session, renewed while signed in'],
          ['ph_*_posthog', 'PostHog', 'Product analytics, feature flags, and error context.', 'Up to 1 year'],
          ['__cf_bm', 'Cloudflare', 'Distinguishes people from bots and protects the network.', '30 minutes'],
          ['zyro-theme', 'ZYR0', 'Remembers light or dark mode. Stored in local storage.', 'Until you clear it'],
          ['__gads, __gpi', 'Google AdSense', 'Measures ad performance and limits how often you see the same ad.', 'Up to 13 months'],
          ['IDE', 'Google DoubleClick', 'Used by Google to serve and personalise ads across sites.', 'Up to 13 months'],
        ],
      },
      {
        kind: 'callout',
        title: 'No tracking on private pages',
        text: 'We do not run advertising cookies inside signed in dashboards, application forms, or verification pages. Ads appear on public content only.',
      },
    ],
  },
  {
    id: 'advertising',
    title: 'Advertising cookies',
    blocks: [
      {
        kind: 'p',
        text: 'Public pages may use Google AdSense. Google and its partners use cookies to show ads based on your visits to this and other websites, and to measure how those ads perform. Depending on your region and your choices, ads may be personalised or non personalised.',
      },
      {
        kind: 'p',
        text: 'You can turn off personalised advertising in Google Ads Settings at google.com/settings/ads, and opt out of many participating vendors at aboutads.info and youronlinechoices.eu.',
      },
      {
        kind: 'p',
        text: 'Blocking advertising cookies does not remove ads. It usually means the ads you see are less relevant to you.',
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    blocks: [
      {
        kind: 'p',
        text: 'We use PostHog to understand product usage and Cloudflare to understand traffic and performance. These tools help us fix problems and decide what to build next. They collect technical and aggregated data, not the contents of your account.',
      },
    ],
  },
  {
    id: 'managing',
    title: 'Managing cookies',
    blocks: [
      {
        kind: 'list',
        items: [
          'Use the consent message on the site to accept or refuse optional cookies, and to change your choice later.',
          'Every major browser lets you block or delete cookies in its settings. Blocking strictly necessary cookies will stop sign in from working.',
          'Private or incognito windows usually clear cookies when you close them.',
          'Browser extensions that block ads or trackers may affect analytics and advertising cookies.',
          'We do not change our behaviour when a browser sends a Do Not Track signal, but the consent controls above always apply.',
        ],
      },
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    blocks: [
      {
        kind: 'p',
        text: 'We update this policy when our providers or the law change. The date at the top shows the current version, and significant changes will be announced on the platform or by email.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    blocks: [
      {
        kind: 'p',
        text: 'Questions about cookies or this policy: privacy@zyroo.org. For general help, use the Help Center or write to support@zyroo.org.',
      },
    ],
  },
];

export default function CookiePolicy() {
  return (
    <LegalPage
      title="Cookie Policy"
      summary="How ZYR0 uses cookies and local storage across the ecosystem, what each one does, and how to control them."
      path="/cookies"
      metaTitle="Cookie Policy"
      metaDescription="Which cookies ZYR0 uses, what they do, how long they last, and how to control them, including advertising and analytics cookies."
      keywords="ZYR0 cookie policy, advertising cookies, analytics cookies, Google AdSense cookies, manage cookies"
      updated="24 November 2026"
      sections={sections}
      contactNote="Questions about cookies?"
      contactEmail="privacy@zyroo.org"
    />
  );
}
