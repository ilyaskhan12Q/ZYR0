import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle2, HelpCircle, BookOpen, Facebook, Loader2, AlertTriangle } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BASE_URL } from '@/config/seo';
import { SITE_CONFIG } from '@/config/site';
import { supabase } from '@/lib/supabase';
import { WhatsAppIcon, LinkedInIcon } from '@/components/icons/BrandIcons';

const CONTACT_CATEGORIES: Record<string, { label: string; to: string }> = {
  general: { label: 'General Inquiry', to: 'support@zyroo.org' },
  support: { label: 'Technical Support', to: 'support@zyroo.org' },
  partnership: { label: 'Partnership', to: 'partnerships@zyroo.org' },
  feedback: { label: 'Feedback', to: 'info@zyroo.org' },
};

const WHATSAPP_DIRECT = 'https://wa.me/923279883150?text=Hi%20ZYR0%2C%20I%20have%20a%20question.';

const CHANNELS = [
  {
    icon: <Mail className="h-4 w-4" />,
    label: 'Email',
    value: SITE_CONFIG.supportEmail,
    note: 'Replies within one business day',
    href: `mailto:${SITE_CONFIG.supportEmail}`,
  },
  {
    icon: <WhatsAppIcon className="h-4 w-4" />,
    label: 'WhatsApp',
    value: 'Join the support group',
    note: 'Quick help and community',
    href: SITE_CONFIG.social.whatsappSupportGroup,
  },
  {
    icon: <LinkedInIcon className="h-4 w-4" />,
    label: 'LinkedIn',
    value: 'ZYR0 on LinkedIn',
    note: 'Company updates and news',
    href: SITE_CONFIG.social.linkedinCompany,
  },
  {
    icon: <Facebook className="h-4 w-4" />,
    label: 'Facebook',
    value: 'ZYR0 on Facebook',
    note: 'Follow the page',
    href: 'https://web.facebook.com/profile.php?id=61591995425665',
  },
];

const contactStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: `${BASE_URL}/contact` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact ZYR0 Support',
    url: `${BASE_URL}/contact`,
    mainEntity: {
      '@type': 'ContactPoint',
      telephone: '+923279883150',
      email: 'support@zyroo.org',
      contactType: 'customer support',
    },
    description: 'Get in touch with the ZYR0 support team for platform questions, partnership inquiries, and technical assistance.',
  },
];

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');

    const category = form.subject;
    const recipient = CONTACT_CATEGORIES[category]?.to || 'support@zyroo.org';
    const { data, error: invokeError } = await supabase.functions.invoke('send-email', {
      body: {
        kind: 'contact',
        to: [recipient],
        name: form.name,
        email: form.email,
        category,
        subject: `[Contact] ${form.name}`,
        message: form.message,
        website: form.website,
        allowUserReplyTo: true,
        from: 'ZYR0 Team <team@zyroo.org>',
        replyTo: form.email,
      },
    });

    if (invokeError) {
      console.error('Contact form send failed:', invokeError);
      setError(invokeError.message || 'Could not send your message. Please try again.');
      setStatus('error');
      return;
    }
    if (data?.error) {
      console.error('Contact form send error:', data.error);
      setError(data.error || 'Could not send your message. Please try again.');
      setStatus('error');
      return;
    }
    setStatus('success');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-14 pb-16">
      <SEO
        title="Contact ZYR0 — Get in Touch with Our Team"
        description="Have questions about ZYR0? Reach out to our support team for help with your account, internship listings, certificate verification, or partnership opportunities. We respond within 24 hours."
        path="/contact"
        keywords="contact ZYR0, ZYR0 support, internship platform help, partnership inquiry"
        structuredData={contactStructuredData}
      />

      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid lg:grid-cols-[1.05fr_1fr]">
          {/* Sapphire panel */}
          <div className="flex flex-col bg-[#0051C3] p-8 text-white sm:p-10 lg:p-14">
            <p className="font-label text-[10px] uppercase tracking-[0.22em] text-white/70">Contact / 001</p>
            <h1 className="mt-6 font-serif text-5xl leading-[0.98] tracking-tight sm:text-6xl">Let's talk.</h1>
            <p className="mt-5 max-w-sm text-[15px] leading-7 text-white/70">
              Questions, partnerships, or a problem to solve. Send a note and a real person will reply.
            </p>

            <div className="mt-10 space-y-1">
              {CHANNELS.map((channel) => {
                const external = channel.href.startsWith('http');
                return (
                  <a
                    key={channel.label}
                    href={channel.href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="-mx-3 flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-white/10 focus-visible-ring"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      {channel.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{channel.label}</span>
                      <span className="block truncate text-sm text-white/80">{channel.value}</span>
                      <span className="mt-0.5 block text-xs text-white/70">{channel.note}</span>
                    </span>
                  </a>
                );
              })}
            </div>

            <div className="mt-10 border-t border-white/15 pt-6">
              <p className="font-label text-[10px] uppercase tracking-[0.16em] text-white/70">Direct line</p>
              <p className="mt-2 text-lg font-medium">+92 327 9883150</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <a
                  href="tel:+923279883150"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-white/20"
                >
                  <Phone className="h-4 w-4" /> Call
                </a>
                <a
                  href={WHATSAPP_DIRECT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-[#0051C3] transition-colors hover:bg-white/90"
                >
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </a>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/70">
                <MapPin className="h-4 w-4" /> Islamabad, Pakistan
              </p>
            </div>
          </div>

          {/* Form panel */}
          <div className="bg-card p-6 sm:p-10 lg:p-12">
            {status === 'success' ? (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-14 w-14 text-[#0051C3]" />
                <h2 className="mt-5 font-heading text-2xl font-semibold tracking-tight">Message sent.</h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                  Thanks for reaching out. We will get back to you within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="font-heading text-xl font-semibold tracking-tight">Send a message</h2>
                  <p className="mt-1 text-sm text-muted-foreground">We usually reply within one business day.</p>
                </div>

                {status === 'error' && (
                  <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-2 block font-label text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      disabled={status === 'sending'}
                      maxLength={100}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#0051C3] focus:outline-none focus:ring-2 focus:ring-[#0051C3]/15 disabled:opacity-60"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-2 block font-label text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      disabled={status === 'sending'}
                      maxLength={320}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#0051C3] focus:outline-none focus:ring-2 focus:ring-[#0051C3]/15 disabled:opacity-60"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div aria-hidden="true" className="hidden">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className="mb-2 block font-label text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Subject</label>
                  <select
                    id="contact-subject"
                    required
                    disabled={status === 'sending'}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-[#0051C3] focus:outline-none focus:ring-2 focus:ring-[#0051C3]/15 disabled:opacity-60"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-2 block font-label text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Message</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    maxLength={5000}
                    disabled={status === 'sending'}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#0051C3] focus:outline-none focus:ring-2 focus:ring-[#0051C3]/15 disabled:opacity-60"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0051C3] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0046a8] focus-visible-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Faster answers */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">Looking for a faster answer?</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm">
            <Link to="/faq" className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
              <HelpCircle className="h-4 w-4" /> FAQ
            </Link>
            <Link to="/help" className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
              <BookOpen className="h-4 w-4" /> Help center
            </Link>
            <Link to="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
