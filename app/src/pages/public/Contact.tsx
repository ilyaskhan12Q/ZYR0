import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, Globe, HelpCircle, BookOpen, Facebook, Loader2, AlertTriangle } from 'lucide-react';
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
    <div className="pt-20 pb-16 px-4">
      <SEO
        title="Contact ZYR0 — Get in Touch with Our Team"
        description="Have questions about ZYR0? Reach out to our support team for help with your account, internship listings, certificate verification, or partnership opportunities. We respond within 24 hours."
        path="/contact"
        keywords="contact ZYR0, ZYR0 support, internship platform help, partnership inquiry"
        structuredData={contactStructuredData}
      />
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold">Contact Us</h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Have questions? We would love to hear from you. Send us a message and we will respond as soon as possible.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <address className="space-y-4 not-italic">
            {[
              { icon: Mail, title: 'Email', value: 'support@zyroo.org', desc: 'We reply within 24 hours' },
              { icon: Phone, title: 'Phone', value: '+923279883150', desc: 'Mon-Fri 9am-6pm PKT' },
              { icon: MapPin, title: 'Office', value: 'Islamabad, 44000, Pakistan', desc: 'Chashte Abad, Haji Camp Road' },
              { icon: WhatsAppIcon, title: 'WhatsApp Support Group', value: SITE_CONFIG.social.whatsappSupportGroup, desc: 'Join our community group for quick help & discussions', isBrand: true, color: 'text-emerald-500' },
              { icon: WhatsAppIcon, title: 'WhatsApp Channel', value: SITE_CONFIG.social.whatsappChannel, desc: 'Latest updates & announcements', isBrand: true, color: 'text-emerald-500' },
              { icon: LinkedInIcon, title: 'LinkedIn Page', value: SITE_CONFIG.social.linkedinCompany, desc: 'Follow our official company page', isBrand: true, color: 'text-blue-500' },
              { icon: Facebook, title: 'Facebook', value: 'https://web.facebook.com/profile.php?id=61591995425665', desc: 'Follow us on Facebook', isBrand: false, color: 'text-accent' },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 shadow-sm flex items-start gap-4 hover:border-accent/30 transition-colors">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.value.startsWith('http') ? (
                    <a href={item.value} target="_blank" rel="noopener noreferrer" className="w-5 h-5 flex items-center justify-center">
                      <item.icon className={`w-5 h-5 ${item.color || 'text-accent'} fill-current`} />
                    </a>
                  ) : (
                    <item.icon className="w-5 h-5 text-accent" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.value.startsWith('http') ? null : (
                    <p className="text-sm text-foreground break-all">{item.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </address>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            {status === 'success' ? (
              <div className="bg-card rounded-xl border border-border p-10 shadow-sm text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                </motion.div>
                <h3 className="mt-4 text-xl font-bold">Message Sent!</h3>
                <p className="mt-2 text-muted-foreground">Thank you for reaching out. We received your message and will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
                {status === 'error' && (
                  <div role="alert" className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="text-sm font-medium mb-1.5 block">Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      disabled={status === 'sending'}
                      maxLength={100}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus-visible-ring disabled:opacity-60"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="text-sm font-medium mb-1.5 block">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      disabled={status === 'sending'}
                      maxLength={320}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus-visible-ring disabled:opacity-60"
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
                  <label htmlFor="contact-subject" className="text-sm font-medium mb-1.5 block">Subject</label>
                  <select
                    id="contact-subject"
                    required
                    disabled={status === 'sending'}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus-visible-ring disabled:opacity-60"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="text-sm font-medium mb-1.5 block">Message</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    maxLength={5000}
                    disabled={status === 'sending'}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none focus-visible-ring disabled:opacity-60"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors focus-visible-ring disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Additional resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 max-w-2xl mx-auto text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">Before reaching out, you may find your answer faster in these resources:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/faq" className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              <HelpCircle className="w-4 h-4 text-accent" /> Browse FAQ
            </Link>
            <Link to="/help" className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              <BookOpen className="w-4 h-4 text-accent" /> Getting Started Guides
            </Link>
            <Link to="/privacy" className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              Privacy Policy
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
