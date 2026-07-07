import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Eye, Download, XCircle, Loader2, Clock,
  CheckCircle2, Send, RotateCcw, AlertTriangle, FileText, ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { revokeOfferLetter } from '@/services/offerLetters';
import type { OfferLetter, OfferLetterStatus } from '@/lib/database.types';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OfferLetterStatus, { label: string; color: string; icon: React.ElementType }> = {
  Pending:  { label: 'Pending',  color: 'bg-amber-100  text-amber-700  dark:bg-amber-950/30  dark:text-amber-400',  icon: Clock },
  Sent:     { label: 'Sent',     color: 'bg-blue-100   text-blue-700   dark:bg-blue-950/30   dark:text-blue-400',   icon: Send },
  Accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400', icon: CheckCircle2 },
  Rejected: { label: 'Rejected', color: 'bg-red-100    text-red-700    dark:bg-red-950/30    dark:text-red-400',    icon: XCircle },
  Revoked:  { label: 'Revoked',  color: 'bg-slate-100  text-slate-600  dark:bg-slate-800/30  dark:text-slate-400', icon: RotateCcw },
  Expired:  { label: 'Expired',  color: 'bg-slate-100  text-slate-600  dark:bg-slate-800/30  dark:text-slate-400', icon: AlertTriangle },
};

const TABS = ['All', 'Pending', 'Sent', 'Accepted', 'Rejected', 'Revoked', 'Expired'] as const;

const OFFER_LETTER_SELECT = `
  *,
  student:profiles!student_id (id, full_name, avatar_url, university),
  company:companies!company_id (id, name, logo_url),
  internship:internships!internship_id (id, title, type, location_type)
`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminOfferLetters() {
  const [offers, setOffers]       = useState<OfferLetter[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [search, setSearch]       = useState('');
  const [revoking, setRevoking]   = useState<string | null>(null);
  const [selected, setSelected]   = useState<OfferLetter | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────
  async function load() {
    setLoading(true);
    try {
      let query = supabase
        .from('offer_letters')
        .select(OFFER_LETTER_SELECT)
        .order('created_at', { ascending: false });

      if (activeTab !== 'All') {
        query = query.eq('status', activeTab);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setOffers(data as OfferLetter[]);
    } catch (err) {
      console.error('Error loading offer letters:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [activeTab]);

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = offers.filter((o) => {
    const q = search.toLowerCase();
    return !q
      || (o.student?.full_name  ?? '').toLowerCase().includes(q)
      || (o.company?.name       ?? '').toLowerCase().includes(q)
      || (o.internship?.title   ?? '').toLowerCase().includes(q)
      || o.id.toLowerCase().includes(q);
  });

  // ── Revoke ───────────────────────────────────────────────────────────────────
  async function handleRevoke(offerId: string) {
    if (!confirm('Revoke this offer letter? This action cannot be undone.')) return;
    setRevoking(offerId);
    try {
      const { error } = await revokeOfferLetter(offerId, 'Revoked by admin');
      if (error) throw error;
      setOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status: 'Revoked' } : o));
    } catch (err) {
      console.error(err);
      alert('Failed to revoke offer letter');
    } finally {
      setRevoking(null);
    }
  }

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = {
    total:    offers.length,
    sent:     offers.filter((o) => o.status === 'Sent').length,
    accepted: offers.filter((o) => o.status === 'Accepted').length,
    revoked:  offers.filter((o) => o.status === 'Revoked').length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Offer Letter Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Audit and manage all offer letters across the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total,    color: 'text-foreground',                 bg: 'bg-card' },
          { label: 'Sent',  value: stats.sent,     color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50  dark:bg-blue-950/20'    },
          { label: 'Accepted', value: stats.accepted, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Revoked',  value: stats.revoked,  color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-50   dark:bg-red-950/20'     },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-border p-4`}>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, company, or offer ID…"
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto border border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  {['Student', 'Company', 'Position', 'Status', 'Issued', 'Email', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No offer letters found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((offer) => {
                    const cfg  = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.Pending;
                    const Icon = cfg.icon;
                    const canRevoke = ['Pending', 'Sent'].includes(offer.status);

                    return (
                      <motion.tr
                        key={offer.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* Student */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={offer.student?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.student?.full_name ?? 'S')}&background=3B82F6&color=fff`}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium">{offer.student?.full_name ?? '—'}</p>
                              <p className="text-xs text-muted-foreground font-mono">{offer.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Company */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {offer.company?.logo_url && (
                              <img src={offer.company.logo_url} alt="" className="w-6 h-6 rounded object-cover" />
                            )}
                            <span className="text-sm">{offer.company?.name ?? '—'}</span>
                          </div>
                        </td>

                        {/* Position */}
                        <td className="px-4 py-3 text-sm">{offer.internship?.title ?? '—'}</td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>

                        {/* Issued */}
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {offer.issued_at ? new Date(offer.issued_at).toLocaleDateString() : '—'}
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3">
                          {offer.email_sent ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelected(offer)}
                              className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {offer.pdf_url && (
                              <a
                                href={offer.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                title="Open PDF"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            {canRevoke && (
                              <button
                                onClick={() => handleRevoke(offer.id)}
                                disabled={revoking === offer.id}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md text-red-500 transition-colors disabled:opacity-50"
                                title="Revoke"
                              >
                                {revoking === offer.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Drawer — inline selected offer details */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelected(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-xl overflow-y-auto max-h-[85vh]"
          >
            <div className="bg-gradient-to-r from-primary to-accent p-5 rounded-t-2xl text-white flex items-center justify-between">
              <div>
                <p className="font-bold">{selected.student?.full_name ?? 'Student'}</p>
                <p className="text-white/70 text-sm">{selected.internship?.title ?? '—'}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-white/10">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Offer ID',  selected.id],
                  ['Company',   selected.company?.name   ?? '—'],
                  ['Status',    selected.status],
                  ['Issued',    selected.issued_at ? new Date(selected.issued_at).toLocaleString() : '—'],
                  ['Expires',   selected.expires_at ? new Date(selected.expires_at).toLocaleString() : '—'],
                  ['Accepted',  selected.accepted_at ? new Date(selected.accepted_at).toLocaleString() : '—'],
                  ['Rejected',  selected.rejected_at ? new Date(selected.rejected_at).toLocaleString() : '—'],
                  ['Revoked',   selected.revoked_at ? new Date(selected.revoked_at).toLocaleString() : '—'],
                  ['Revoke reason', selected.revoke_reason ?? '—'],
                  ['Email sent', selected.email_sent ? 'Yes' : 'No'],
                  ['Email sent at', selected.email_sent_at ? new Date(selected.email_sent_at).toLocaleString() : '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="font-medium mt-0.5 break-all text-xs">{v}</p>
                  </div>
                ))}
              </div>
              {selected.pdf_url && (
                <a
                  href={selected.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors w-fit"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
