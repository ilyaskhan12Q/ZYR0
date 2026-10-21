import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Shield, QrCode, HelpCircle, BookOpen } from 'lucide-react';
import { verifyCertificate } from '@/services/certificates';
import { supabase } from '@/lib/supabase';
import CertificateDocument from '@/components/CertificateDocument';
import { QrScanner } from '@/components/QrScanner';
import { SEO } from '@/components/SEO';
import { ButtonLoader } from '@/components/common/Loader';

/** Pull a credential ID out of a scanned QR payload (full URL or raw ID). */
function extractId(decodedText: string): string | null {
  const candidate = decodedText.split('/').filter(Boolean).pop()?.split('?')[0]?.trim();
  return candidate || null;
}

export default function Verify() {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const idQuery = searchParams.get('id');

  const [certId, setCertId] = useState('');
  const [certResult, setCertResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [certLoading, setCertLoading] = useState(false);
  const [verifiedCert, setVerifiedCert] = useState<any>(null);
  const [sampleCerts, setSampleCerts] = useState<string[]>([]);

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

  // ── URL-driven entry: /verify/:code or /verify?id=… ─────────────────────────
  useEffect(() => {
    const id = code || idQuery;
    if (id) {
      setCertId(id);
      handleVerifyCert(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idQuery, code]);

  /** Handle a QR scan result — extracts the ID and verifies immediately. */
  const handleScanned = (decodedText: string) => {
    const now = Date.now();
    if (now - lastScanRef.current < 1000) return;
    lastScanRef.current = now;

    const scannedId = extractId(decodedText);
    if (!scannedId) return;

    setCertId(scannedId);
    handleVerifyCert(scannedId);
  };

  const certRevoked = verifiedCert?.status === 'Revoked';

  return (
    <div className="pb-16 px-4 min-h-page">
      <SEO
        title="Verify Certificate — Authenticate ZYR0 Credentials"
        description="Instantly verify the authenticity of any ZYR0-issued internship certificate using its unique credential ID. Verification for students, employers, and institutions."
        path="/verify"
        keywords="verify certificate, internship certificate verification, credential verification, ZYR0"
      />
      <div className="max-w-4xl mx-auto">
        <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-accent" aria-hidden="true" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Verify Credentials</h1>
          <p className="mt-3 text-muted-foreground">Verify the authenticity of ZYR0 certificates</p>
        </m.div>

        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
          className="bg-card rounded-xl border border-border p-6 shadow-sm max-w-2xl mx-auto">

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
              {certLoading ? <ButtonLoader size={16} dotSize={2.5} /> : 'Verify'}
            </button>
          </div>
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <QrCode className="w-4 h-4" aria-hidden="true" />
              <span>Or scan a QR code</span>
            </div>
            <QrScanner onScan={handleScanned} />
          </div>

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
        </m.div>

        {/* Result status for screen readers */}
        <div className="sr-only" role="status" aria-live="polite">
          {certLoading && 'Verifying certificate...'}
          {certResult === 'valid' && 'Certificate successfully verified.'}
          {certResult === 'invalid' && 'Certificate verification failed.'}
        </div>

        <AnimatePresence mode="wait">
          {certResult === 'valid' && verifiedCert && (
            <m.div key="valid-cert" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="mt-8 space-y-6">
              <div className={`${certRevoked ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'} border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${certRevoked ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                    <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${certRevoked ? 'text-amber-800 dark:text-amber-400' : 'text-emerald-800 dark:text-emerald-400'}`}>
                      {certRevoked ? 'Certificate Found — Revoked' : 'Verified Authentic'}
                    </h3>
                    <p className={`text-xs ${certRevoked ? 'text-amber-700/80 dark:text-amber-500/80' : 'text-emerald-700/80 dark:text-emerald-500/80'}`}>
                      {certRevoked
                        ? 'This credential has been revoked by ZYR0 and no longer represents a valid record.'
                        : 'This credential matches ZYR0\u2019s official record for this certificate ID.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${certRevoked ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {certRevoked ? 'Revoked' : 'Verified'}
                  </span>
                </div>
              </div>
              <CertificateDocument certificate={verifiedCert} showActions={false} />
            </m.div>
          )}
          {certResult === 'invalid' && (
            <m.div key="invalid-cert" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 bg-card rounded-xl border-2 border-red-200 dark:border-red-900/30 shadow-lg overflow-hidden max-w-2xl mx-auto" role="alert">
              <div className="bg-red-50 dark:bg-red-950/20 p-6 text-center">
                <m.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" aria-hidden="true" />
                </m.div>
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
            </m.div>
          )}
        </AnimatePresence>

        {/* Help links */}
        <m.div
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
        </m.div>
      </div>
    </div>
  );
}
