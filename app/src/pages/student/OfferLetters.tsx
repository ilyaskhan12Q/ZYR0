import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, CheckCircle2, XCircle, Search, Eye,
  Clock, AlertTriangle, Loader2, Building2, Calendar, MapPin,
  BadgeCheck, RotateCcw, ExternalLink, Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getMyOfferLetters,
  acceptOfferLetter,
  rejectOfferLetter,
} from '@/services/offerLetters';
import type { OfferLetter, OfferLetterStatus } from '@/lib/database.types';
import { dispatchNotificationWithSimulation } from '@/services/notificationsSim';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OfferLetterStatus, { label: string; color: string; icon: React.ElementType }> = {
  Pending:  { label: 'Pending',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',   icon: Clock },
  Sent:     { label: 'Sent',     color: 'bg-blue-100  text-blue-700  dark:bg-blue-950/30  dark:text-blue-400',    icon: FileText },
  Accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400', icon: CheckCircle2 },
  Rejected: { label: 'Rejected', color: 'bg-red-100   text-red-700   dark:bg-red-950/30   dark:text-red-400',    icon: XCircle },
  Revoked:  { label: 'Revoked',  color: 'bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400',  icon: RotateCcw },
  Expired:  { label: 'Expired',  color: 'bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400',  icon: AlertTriangle },
};

const TABS = ['All', 'Sent', 'Accepted', 'Rejected', 'Revoked'] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function StudentOfferLetters() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [offers, setOffers]         = useState<OfferLetter[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<string>('All');
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<OfferLetter | null>(null);
  const [responding, setResponding] = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getMyOfferLetters();
      if (data) setOffers(data as OfferLetter[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (user) load(); }, [user, load]);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = offers.filter((o) => {
    const matchTab    = activeTab === 'All' || o.status === activeTab;
    const q           = search.toLowerCase();
    const matchSearch = !q
      || (o.internship?.title ?? '').toLowerCase().includes(q)
      || (o.company?.name  ?? '').toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  // ── Respond ─────────────────────────────────────────────────────────────────
  async function handleAccept(id: string) {
    setResponding(id);
    setError(null);
    try {
      const { data, error: err } = await acceptOfferLetter(id);
      if (err) throw err;
      
      const offer = offers.find((o) => o.id === id);
      if (offer && offer.company_id) {
        try {
          await dispatchNotificationWithSimulation({
            userId: offer.company_id,
            title: 'Offer Accepted',
            message: `${offer.student?.full_name || 'A student'} has accepted your internship offer for "${offer.internship?.title}".`,
            type: 'application',
            actionUrl: '/company/offer-letters',
          });
        } catch (notifErr) {
          console.error('Failed to trigger accept notification simulation:', notifErr);
        }
      }

      setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'Accepted', accepted_at: data?.accepted_at ?? null } : o)));
      setSelected((prev) => prev?.id === id ? { ...prev, status: 'Accepted' } : prev);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to accept offer. Please try again.');
    } finally {
      setResponding(null);
    }
  }

  async function handleReject(id: string) {
    if (!confirm('Are you sure you want to reject this offer letter? This cannot be undone.')) return;
    setResponding(id);
    setError(null);
    try {
      const { data, error: err } = await rejectOfferLetter(id);
      if (err) throw err;

      const offer = offers.find((o) => o.id === id);
      if (offer && offer.company_id) {
        try {
          await dispatchNotificationWithSimulation({
            userId: offer.company_id,
            title: 'Offer Declined',
            message: `${offer.student?.full_name || 'A student'} has declined your internship offer for "${offer.internship?.title}".`,
            type: 'application',
            actionUrl: '/company/offer-letters',
          });
        } catch (notifErr) {
          console.error('Failed to trigger reject notification simulation:', notifErr);
        }
      }

      setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'Rejected', rejected_at: data?.rejected_at ?? null } : o)));
      setSelected((prev) => prev?.id === id ? { ...prev, status: 'Rejected' } : prev);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to reject offer. Please try again.');
    } finally {
      setResponding(null);
    }
  }

  // ── Download ─────────────────────────────────────────────────────────────────
  function handleDownload(offer: OfferLetter) {
    if (!offer.pdf_url) return;
    const a = document.createElement('a');
    a.href     = offer.pdf_url;
    a.download = `offer-letter-${offer.id.slice(0, 8)}.png`;
    a.target   = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Offer Letters</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Official internship offers from companies
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg">
          <BadgeCheck className="w-4 h-4 text-accent" />
          {offers.filter((o) => o.status === 'Accepted').length} accepted
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 border border-red-100 dark:border-red-900">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by internship or company..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-card rounded-xl border border-border"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No offer letters yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            When a company accepts your application, their offer letter will appear here.
          </p>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((offer, i) => {
          const cfg    = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.Pending;
          const Icon   = cfg.icon;
          const canAct = offer.status === 'Sent';

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Card top gradient */}
              <div className="h-2 bg-gradient-to-r from-primary to-accent" />

              <div className="p-5 space-y-4">
                {/* Company + Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {offer.company?.logo_url ? (
                      <img
                        src={offer.company.logo_url}
                        alt={offer.company.name}
                        className="w-10 h-10 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-accent" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{offer.company?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{offer.internship?.title ?? '—'}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${cfg.color}`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {offer.internship?.start_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(offer.internship.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                  {offer.internship?.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {offer.internship.location_type ?? offer.internship.location}
                    </div>
                  )}
                  {offer.issued_at && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Clock className="w-3.5 h-3.5" />
                      Issued {new Date(offer.issued_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                  {offer.expires_at && (
                    <div className="flex items-center gap-1.5 col-span-2 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Expires {new Date(offer.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelected(offer)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>

                  {offer.pdf_url && (
                    <button
                      onClick={() => handleDownload(offer)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  {offer.status === 'Accepted' && (
                    <button
                      onClick={() => navigate(`/student/workspace/${offer.internship_id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-accent text-white hover:bg-accent/90 font-medium text-sm transition-all duration-200 shadow-sm shadow-accent/20"
                    >
                      <Briefcase className="w-4 h-4 animate-pulse" />
                      Workspace
                    </button>
                  )}

                  {canAct && (
                    <>
                      <button
                        onClick={() => handleAccept(offer.id)}
                        disabled={responding === offer.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {responding === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(offer.id)}
                        disabled={responding === offer.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm hover:bg-red-200 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {selected && (
          <OfferLetterModal
            offer={selected}
            onClose={() => setSelected(null)}
            onAccept={handleAccept}
            onReject={handleReject}
            onDownload={handleDownload}
            responding={responding}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  offer: OfferLetter;
  onClose: () => void;
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onDownload: (offer: OfferLetter) => void;
  responding: string | null;
}

function OfferLetterModal({ offer, onClose, onAccept, onReject, onDownload, responding }: ModalProps) {
  const navigate = useNavigate();
  const cfg  = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.Pending;
  const Icon = cfg.icon;
  const canAct = offer.status === 'Sent';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-t-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {offer.company?.logo_url ? (
                <img src={offer.company.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover bg-white/10" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
              )}
              <div>
                <p className="font-bold text-lg">{offer.company?.name ?? 'Company'}</p>
                <p className="text-white/70 text-sm">Official Offer Letter</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/20`}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Internship Details */}
          <div className="bg-muted/40 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Position Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Position',    offer.internship?.title    ?? '—'],
                ['Type',        offer.internship?.type     ?? '—'],
                ['Duration',    offer.internship?.duration ?? '—'],
                ['Start Date',  offer.internship?.start_date ? new Date(offer.internship.start_date).toLocaleDateString() : '—'],
                ['Compensation', offer.internship?.stipend ? `${offer.internship.stipend} (${offer.internship.stipend_type})` : '—'],
                ['Work Mode',   offer.internship?.location_type ?? '—'],
                ['Location',    offer.internship?.location  ?? offer.company?.location ?? '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="text-sm font-medium mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Offer meta */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {offer.issued_at && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 text-accent" />
                Issued {new Date(offer.issued_at).toLocaleDateString()}
              </div>
            )}
            {offer.expires_at && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                Expires {new Date(offer.expires_at).toLocaleDateString()}
              </div>
            )}
            {offer.accepted_at && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Accepted {new Date(offer.accepted_at).toLocaleDateString()}
              </div>
            )}
            {offer.rejected_at && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="w-4 h-4" />
                Rejected {new Date(offer.rejected_at).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Offer ID */}
          <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-3 py-2 rounded-lg break-all">
            Offer ID: {offer.id}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-1">
            {offer.pdf_url && (
              <button
                onClick={() => onDownload(offer)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
            {offer.pdf_url && (
              <a
                href={offer.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </a>
            )}
            {offer.status === 'Accepted' && (
              <button
                onClick={() => {
                  onClose();
                  navigate(`/student/workspace/${offer.internship_id}`);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors shadow-sm"
              >
                <Briefcase className="w-4 h-4 animate-pulse" />
                Go to Workspace
              </button>
            )}
            {canAct && (
              <>
                <button
                  onClick={() => onAccept(offer.id)}
                  disabled={responding === offer.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {responding === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Accept Offer
                </button>
                <button
                  onClick={() => onReject(offer.id)}
                  disabled={responding === offer.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Offer
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
