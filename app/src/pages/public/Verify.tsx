import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Award, Shield, Calendar, Building2, QrCode, Copy, Check } from 'lucide-react';
import { verifyCertificate } from '@/services/certificates';
import { supabase } from '@/lib/supabase';

export default function Verify() {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [loading, setLoading] = useState(false);
  const [verifiedCert, setVerifiedCert] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [sampleCerts, setSampleCerts] = useState<string[]>([]);

  useEffect(() => {
    async function loadSamples() {
      const { data } = await supabase
        .from('certificates')
        .select('credential_id')
        .limit(3);
      if (data) {
        setSampleCerts(data.map(c => c.credential_id));
      }
    }
    loadSamples();
  }, []);

  const handleVerify = async () => {
    if (!certId.trim()) return;
    setLoading(true);
    setResult('idle');
    setVerifiedCert(null);

    try {
      const { data, error } = await verifyCertificate(certId.trim());
      if (error || !data) {
        setResult('invalid');
      } else {
        setResult('valid');
        setVerifiedCert(data);
      }
    } catch (err) {
      setResult('invalid');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(certId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Verify Certificate</h1>
          <p className="mt-3 text-muted-foreground">Enter a certificate ID or scan a QR code to verify authenticity</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={certId} onChange={(e) => { setCertId(e.target.value); setResult('idle'); }}
                placeholder="Enter Certificate ID (e.g., ZYRO-SE-2024-001234)"
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()} />
            </div>
            <button onClick={handleVerify} disabled={loading || !certId.trim()}
              className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify'}
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <QrCode className="w-4 h-4" />
            <span>Or scan a QR code</span>
          </div>

          {/* Sample IDs */}
          {sampleCerts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Try these sample IDs:</p>
              <div className="flex flex-wrap gap-2">
                {sampleCerts.map(id => (
                  <button key={id} onClick={() => { setCertId(id); setResult('idle'); }}
                    className="text-xs px-2.5 py-1 bg-muted rounded-full hover:bg-accent/10 hover:text-accent transition-colors">
                    {id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result === 'valid' && verifiedCert && (
            <motion.div key="valid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 bg-card rounded-xl border-2 border-emerald-200 shadow-lg overflow-hidden">
              <div className="bg-emerald-50 p-6 text-center border-b border-emerald-100">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                </motion.div>
                <h2 className="mt-4 text-2xl font-bold text-emerald-700">Certificate Verified</h2>
                <p className="text-sm text-emerald-600 mt-1">This is a valid certificate issued by Zyro</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Award className="w-8 h-8 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-lg">{verifiedCert.title}</p>
                    <p className="text-sm text-muted-foreground">{verifiedCert.internship?.title || 'Internship Opportunity'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Recipient</p>
                    <p className="text-sm font-medium">{verifiedCert.recipient?.full_name || 'N/A'}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Issuing Organization</p>
                    <p className="text-sm font-medium">{verifiedCert.company?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Issue Date</p>
                    <p className="text-sm font-medium">{new Date(verifiedCert.issue_date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Credential ID</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium font-mono">{verifiedCert.credential_id}</p>
                      <button onClick={handleCopy} className="text-accent hover:text-accent/80">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
                {verifiedCert.skills && verifiedCert.skills.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {verifiedCert.skills.map((s: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {verifiedCert.blockchain_hash && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Blockchain Hash</p>
                    <p className="text-xs font-mono text-muted-foreground truncate">{verifiedCert.blockchain_hash}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {result === 'invalid' && (
            <motion.div key="invalid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 bg-card rounded-xl border-2 border-red-200 shadow-lg overflow-hidden">
              <div className="bg-red-50 p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                </motion.div>
                <h2 className="mt-4 text-2xl font-bold text-red-700">Certificate Not Found</h2>
                <p className="text-sm text-red-600 mt-1">The certificate ID you entered could not be verified.</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-muted-foreground text-sm mb-4">Please check the ID and try again. If you believe this is an error, please contact support.</p>
                <button onClick={() => { setCertId(''); setResult('idle'); }}
                  className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
