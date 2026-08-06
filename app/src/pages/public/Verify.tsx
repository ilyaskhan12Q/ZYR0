import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Award, Shield, QrCode, HelpCircle, BookOpen, FileText } from 'lucide-react';
import { verifyCertificate } from '@/services/certificates';
import { getOfferLetterById } from '@/services/offerLetters';
import { supabase } from '@/lib/supabase';
import CertificateDocument from '@/components/CertificateDocument';
import OfferLetterDocument from '@/components/OfferLetterDocument';
import { QrScanner } from '@/components/QrScanner';
import { SEO } from '@/components/SEO';
import { ButtonLoader } from '@/components/common/Loader';

type VerifyTab = 'certificate' | 'offer';

/** Pull a credential/offer ID out of a scanned QR payload (full URL or raw ID). */
function extractId(decodedText: string): string | null {
  const candidate = decodedText.split('/').filter(Boolean).pop()?.split('?')[0]?.trim();
  return candidate || null;
}

function isOfferUrl(decodedText: string): boolean {
  return decodedText.includes('/verify-offer/');
}

export default function Verify() {
  const { code } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlType = searchParams.get('type');
  const idQuery = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<VerifyTab>(urlType === 'offer' ? 'offer' : 'certificate');

  // ── Certificate state ────────────────────────────────────────────────────────
  const [certId, setCertId] = useState('');
  const [certResult, setCertResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [certLoading, setCertLoading] = useState(false);
  const [verifiedCert, setVerifiedCert] = useState<any>(null);
  const [sampleCerts, setSampleCerts] = useState<string[]>([]);

  // ── Offer letter state ───────────────────────────────────────────────────────
  const [offerId, setOfferId] = useState('');
  const [offerResult, setOfferResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [offerLoading, setOfferLoading] = useState(false);
  const [verifiedOffer, setVerifiedOffer] = useState<any>(null);

  const lastScanRef = useRef(0);

  // Load sample certificate IDs for quick trials.
  useEffect(() => {
    async function loadSamples() {
      const { data } = await supabase
        .from('certificates')
        .select('credential_id')
        .limit(3);

      setSampleCerts(data ? data.map(c => c.credential_id) : []);
    }
    loadSamples();
  }, []);

  // ── Certificate verification ────────────────────────────────────────────────
  const handleVerifyCert = async (idToVerify?: string) => {
    const targetId = idToVerify || certId;
    if (!targetId.trim()) return;
    setCertLoading(true);
    setCertResult('idle');
    setVerifiedCert(null);

    try {
      const { data, error } = await verifyCertificate(targetId.trim());
      if (error || !data) {
        setCertResult('invalid');
      } else {
        setCertResult('valid');
        setVerifiedCert(data);
      }
    } catch (err) {
      setCertResult('invalid');
    } finally {
      setCertLoading(false);
    }
  };

  // ── Offer letter verification ───────────────────────────────────────────────
  const handleVerifyOffer = async (idToVerify?: string) => {
    const targetId = idToVerify || offerId;
    if (!targetId.trim()) return;
    setOfferLoading(true);
    setOfferResult('idle');
    setVerifiedOffer(null);

    try {
      const { data, error } = await getOfferLetterById(targetId.trim(), false);
      if (error || !data) {
        setOfferResult('invalid');
      } else {
        setOfferResult('valid');
        setVerifiedOffer(data);
      }
    } catch (err) {
      setOfferResult('invalid');
    } finally {
      setOfferLoading(false);
    }
  };

  // ── URL-driven entry: /verify?type=certificate|offer&id=… or /verify/:code ─
  useEffect(() => {
    if (urlType === 'offer') {
      setActiveTab('offer');
      if (idQuery) {
        setOfferId(idQuery);
        handleVerifyOffer(idQuery);
      }
    } else if (urlType === 'certificate') {
      setActiveTab('certificate');
      if (idQuery) setCertId(idQuery);
    } else if (code) {
      setActiveTab('certificate');
      setCertId(code);
      handleVerifyCert(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlType, idQuery, code]);

  /** Handle a QR scan result — extracts the ID and verifies immediately. */
  const handleScanned = (decodedText: string) => {
    const now = Date.now();
    if (now - lastScanRef.current < 1000) return;
    lastScanRef.current = now;

    const scannedId = extractId(decodedText);
    if (!scannedId) return;

    if (isOfferUrl(decodedText)) {
      switchTab('offer');
      setTimeout(() => {
        setOfferId(scannedId);
        handleVerifyOffer(scannedId);
      }, 0);
    } else {
      switchTab('certificate');
      setTimeout(() => {
        setCertId(scannedId);
        handleVerifyCert(scannedId);
      }, 0);
    }
  };

  const switchTab = (tab: VerifyTab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'offer' ? { type: 'offer' } : {}, { replace: true });
  };

  const offerStatusLabel = verifiedOffer?.status === 'Revoked'
    ? 'This offer has been revoked'
    : verifiedOffer?.status === 'Rejected'
    ? 'This offer was declined'
    : verifiedOffer?.status === 'Accepted'
    ? 'This offer has been accepted'
    : verifiedOffer?.status === 'Expired'
    ? 'This offer has expired'
    : 'This offer matches ZYR0&apos;s official record for this offer ID.';

  const offerInactive = verifiedOffer && ['Revoked', 'Expired'].includes(verifiedOffer.status);

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <SEO
        title={activeTab === 'offer' ? 'Verify Offer Letter — Authenticate ZYR0 Offers' : 'Verify Certificate — Authenticate ZYR0 Credentials'}
        description={
          activeTab === 'offer'
            ? 'Instantly verify the authenticity of any ZYR0-issued internship offer letter using its unique offer ID. Verification for students, employers, and institutions.'
            : 'Instantly verify the authenticity of any ZYR0-issued internship certificate using its unique credential ID. Blockchain-backed verification for students, employers, and institutions.'
        }
        path="/verify"
        keywords="verify certificate, internship certificate verification, verify offer letter, offer verification, credential verification, ZYR0"
      />
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-accent" aria-hidden="true" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Verify Credentials</h1>
          <p className="mt-3 text-muted-foreground">Verify the authenticity of ZYR0 certificates and offer letters</p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="max-w-2xl mx-auto mb-4">
          <div className="flex items-center bg-muted rounded-xl p-1 gap-1">
            <button
              onClick={() => switchTab('certificate')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible-ring ${
                activeTab === 'certificate' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Award className="w-4 h-4" aria-hidden="true" />
              Certificate
            </button>
            <button
              onClick={() => switchTab('offer')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible-ring ${
                activeTab === 'offer'
                  ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              Offer Letter
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: activeTab === 'offer' ? 0 : 1 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
          className="bg-card rounded-xl border border-border p-6 shadow-sm max-w-2xl mx-auto">

          {/* ── Certificate tab: search card ── */}
          {activeTab === 'certificate' && (
            <>
              <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <label htmlFor="cert-id" className="sr-only">Certificate ID</label>
                <input
                  id="cert-id"
                  type="text"
                  value={certId}
                  onChange={(e) => { setCertId(e.target.value); setCertResult('idle'); }}
                  placeholder="Enter Certificate ID (e.g., ZYR0-SE-2024-001234)"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus-visible-ring"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyCert()}
                />
              </div>
              <button
                onClick={() => handleVerifyCert()}
                disabled={certLoading || !certId.trim()}
                className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus-visible-ring"
              >
                {certLoading ? (
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

            {/* Sample IDs */}
            {sampleCerts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Try these sample IDs:</p>
                <div className="flex flex-wrap gap-2">
                  {sampleCerts.map(id => (
                    <button
                      key={id}
                      onClick={() => { setCertId(id); setCertResult('idle'); }}
                      className="text-xs px-2.5 py-1 bg-muted rounded-full hover:bg-accent/10 hover:text-accent transition-colors focus-visible-ring"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            )}
            </>
          )}

          {/* ── Offer letter tab: search card ── */}
          {activeTab === 'offer' && (
            <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="offer-id" className="sr-only">Offer ID</label>
              <input
                id="offer-id"
                type="text"
                value={offerId}
                onChange={(e) => { setOfferId(e.target.value); setOfferResult('idle'); }}
                placeholder="Enter Offer ID (e.g., f67880b0-9ed4-41d3-8657-80b4778713bd)"
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus-visible-ring"
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOffer()}
              />
            </div>
            <button
              onClick={() => handleVerifyOffer()}
              disabled={offerLoading || !offerId.trim()}
              className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus-visible-ring"
            >
              {offerLoading ? (
                <ButtonLoader size={16} dotSize={2.5} />
              ) : (
                'Verify'
              )}
            </button>
          </div>
          )}
        </motion.div>

        {/* Result status for screen readers */}
        <div className="sr-only" role="status" aria-live="polite">
          {activeTab === 'offer'
            ? (offerLoading && 'Verifying offer letter...')
            : (certLoading && 'Verifying certificate...')}
          {activeTab === 'offer'
            ? (offerResult === 'valid' && 'Offer letter successfully verified.') || (offerResult === 'invalid' && 'Offer letter verification failed.')
            : null}
          {activeTab === 'certificate'
            ? (certResult === 'valid' && 'Certificate successfully verified.') || (certResult === 'invalid' && 'Certificate verification failed.')
            : null}
        </div>

        {/* Result visual layout */}
        <AnimatePresence mode="wait">
          {/* Certificate result */}
          {activeTab === 'certificate' && certResult === 'valid' && verifiedCert && (
            <motion.div key="valid-cert" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="mt-8 space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-400">Verified Authentic</h3>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-500/80">This credential matches ZYR0&apos;s official record for this certificate ID.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-500 text-white font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                </div>
              </div>
              <CertificateDocument certificate={verifiedCert} />
            </motion.div>
          )}
          {activeTab === 'certificate' && certResult === 'invalid' && (
            <motion.div key="invalid-cert" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 bg-card rounded-xl border-2 border-red-200 dark:border-red-900/30 shadow-lg overflow-hidden max-w-2xl mx-auto" role="alert">
              <div className="bg-red-50 dark:bg-red-950/20 p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" aria-hidden="true" />
                </motion.div>
                <h2 className="mt-4 text-2xl font-bold text-red-700 dark:text-red-400">Certificate Not Found</h2>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">The certificate ID you entered could not be verified.</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-muted-foreground text-sm mb-4">Please check the ID and try again. If you believe this is an error, please contact support.</p>
                <button
                  onClick={() => { setCertId(''); setCertResult('idle'); }}
                  className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors focus-visible-ring"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {/* Offer letter result */}
          {activeTab === 'offer' && offerResult === 'valid' && verifiedOffer && (
            <motion.div key="valid-offer" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="mt-8 space-y-6">
              <div className={`rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                offerInactive ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    offerInactive ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${offerInactive ? 'text-amber-800 dark:text-amber-400' : 'text-emerald-800 dark:text-emerald-400'}`}>
                      {offerInactive ? 'Offer Found — Inactive' : 'Verified Authentic'}
                    </h3>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-500/80">{offerStatusLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    offerInactive ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {offerInactive ? 'Inactive' : 'Verified'}
                  </span>
                </div>
              </div>
              <div className="flex justify-center">
                <OfferLetterDocument offer={verifiedOffer} showActions={false} />
              </div>
            </motion.div>
          )}
          {activeTab === 'offer' && offerResult === 'invalid' && (
            <motion.div key="invalid-offer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
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
                  onClick={() => { setOfferId(''); setOfferResult('idle'); }}
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
              <BookOpen className="w-4 h-4 text-accent" /> Verification Guide
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