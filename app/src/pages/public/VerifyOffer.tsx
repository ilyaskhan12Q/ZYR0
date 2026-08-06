import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, XCircle, FileText, Shield, QrCode, HelpCircle, BookOpen } from 'lucide-react';
import { getOfferLetterById } from '@/services/offerLetters';
import OfferLetterDocument from '@/components/OfferLetterDocument';
import { QrScanner } from '@/components/QrScanner';
import { SEO } from '@/components/SEO';
import { ButtonLoader } from '@/components/common/Loader';

/** Pull an offer id out of a scanned QR payload (full URL or raw id). */
function extractOfferId(decodedText: string): string | null {
  const candidate = decodedText.split('/').filter(Boolean).pop()?.split('?')[0]?.trim();
  return candidate || null;
}

export default function VerifyOffer() {
  const { id } = useParams();

  const [offerId, setOfferId] = useState('');
  const [result, setResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [loading, setLoading] = useState(false);
  const [verifiedOffer, setVerifiedOffer] = useState<any>(null);
  const lastScanRef = useRef(0);

  const handleVerify = async (idToVerify?: string) => {
    const targetId = idToVerify || offerId;
    if (!targetId.trim()) return;
    setLoading(true);
    setResult('idle');
    setVerifiedOffer(null);

    try {
      const { data, error } = await getOfferLetterById(targetId.trim(), false);
      if (error || !data) {
        setResult('invalid');
      } else {
        setResult('valid');
        setVerifiedOffer(data);
      }
    } catch (err) {
      setResult('invalid');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setOfferId(id);
      handleVerify(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /** Handle a QR scan result — extracts the id, fills the input and verifies immediately. */
  const handleScanned = (decodedText: string) => {
    const now = Date.now();
    if (now - lastScanRef.current < 1000) return;
    lastScanRef.current = now;

    const scannedId = extractOfferId(decodedText);
    if (!scannedId) return;
    setOfferId(scannedId);
    setResult('idle');
    handleVerify(scannedId);
  };

  const statusLabel = verifiedOffer?.status === 'Revoked'
    ? 'This offer has been revoked'
    : verifiedOffer?.status === 'Rejected'
    ? 'This offer was declined'
    : verifiedOffer?.status === 'Accepted'
    ? 'This offer has been accepted'
    : verifiedOffer?.status === 'Expired'
    ? 'This offer has expired'
    : 'This offer matches ZYR0&apos;s official record for this offer ID.';

  const statusBadge =
    verifiedOffer?.status === 'Revoked' || verifiedOffer?.status === 'Expired'
      ? { text: 'Inactive', cls: 'bg-amber-500 text-white' }
      : { text: 'Verified', cls: 'bg-emerald-500 text-white' };

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <SEO
        title="Verify Offer Letter — Authenticate ZYR0 Offers"
        description="Instantly verify the authenticity of any ZYR0-issued internship offer letter using its unique offer ID. Verification for students, employers, and institutions."
        path="/verify-offer"
        keywords="verify offer letter, internship offer verification, ZYR0 offer, offer authentication, credential verification"
      />
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-accent" aria-hidden="true" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Verify Offer Letter</h1>
          <p className="mt-3 text-muted-foreground">Enter an offer ID or scan a QR code to verify authenticity</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-6 shadow-sm max-w-2xl mx-auto">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="offer-id" className="sr-only">Offer ID</label>
              <input
                id="offer-id"
                type="text"
                value={offerId}
                onChange={(e) => { setOfferId(e.target.value); setResult('idle'); }}
                placeholder="Enter Offer ID (e.g., f67880b0-9ed4-41d3-8657-80b4778713bd)"
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus-visible-ring"
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={loading || !offerId.trim()}
              className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus-visible-ring"
            >
              {loading ? (
                <ButtonLoader size={16} dotSize={2.5} />
              ) : (
                'Verify'
              )}
            </button>
          </div>
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <QrCode className="w-4 h-4" aria-hidden="true" />
              <span>Or scan a QR code</span>
            </div>
            <QrScanner onScan={handleScanned} />
          </div>
        </motion.div>

        {/* Result status for screen readers */}
        <div className="sr-only" role="status" aria-live="polite">
          {loading && 'Verifying offer letter...'}
          {result === 'valid' && 'Offer letter successfully verified.'}
          {result === 'invalid' && 'Offer letter verification failed.'}
        </div>

        {/* Result visual layout */}
        <AnimatePresence mode="wait">
          {result === 'valid' && verifiedOffer && (
            <motion.div key="valid" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="mt-8 space-y-6">
              {/* Success Badge Banner */}
              <div className={`rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                verifiedOffer.status === 'Revoked' || verifiedOffer.status === 'Expired'
                  ? 'bg-amber-500/10 border border-amber-500/20'
                  : 'bg-emerald-500/10 border border-emerald-500/20'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    verifiedOffer.status === 'Revoked' || verifiedOffer.status === 'Expired'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${verifiedOffer.status === 'Revoked' || verifiedOffer.status === 'Expired' ? 'text-amber-800 dark:text-amber-400' : 'text-emerald-800 dark:text-emerald-400'}`}>
                      {verifiedOffer.status === 'Revoked' || verifiedOffer.status === 'Expired'
                        ? 'Offer Found — Inactive'
                        : 'Verified Authentic'}
                    </h3>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-500/80">{statusLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusBadge.cls}`}>
                    {statusBadge.text}
                  </span>
                </div>
              </div>

              {/* The Offer Letter Visual Layout */}
              <div className="flex justify-center">
                <OfferLetterDocument offer={verifiedOffer} showActions={false} />
              </div>
            </motion.div>
          )}
          {result === 'invalid' && (
            <motion.div key="invalid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 bg-card rounded-xl border-2 border-red-200 dark:border-red-900/30 shadow-lg overflow-hidden max-w-2xl mx-auto" role="alert">
              <div className="bg-red-50 dark:bg-red-950/20 p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" aria-hidden="true" />
                </motion.div>
                <h2 className="mt-4 text-2xl font-bold text-red-700 dark:text-red-400">Offer Letter Not Found</h2>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">The offer ID you entered could not be verified.</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-muted-foreground text-sm mb-4">Please check the ID and try again. If you believe this is an error, please contact support.</p>
                <button
                  onClick={() => { setOfferId(''); setResult('idle'); }}
                  className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors focus-visible-ring"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground mb-3">Having trouble with verification?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/help" className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              <BookOpen className="w-4 h-4 text-accent" /> Offer Letter Verification Guide
            </Link>
            <Link to="/faq" className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              <HelpCircle className="w-4 h-4 text-accent" /> Visit FAQ
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              Contact Support
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}