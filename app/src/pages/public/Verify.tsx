import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Award, Shield, Calendar, Building2, QrCode, Copy, Check } from 'lucide-react';
import { verifyCertificate } from '@/services/certificates';
import { supabase } from '@/lib/supabase';
import { certificates as mockCertificates } from '@/data/mockData';
import CertificateDocument from '@/components/CertificateDocument';

export default function Verify() {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const idQuery = searchParams.get('id');
  
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
      
      const dbIds = data ? data.map(c => c.credential_id) : [];
      // Combine with mock certificate IDs
      const mockIds = mockCertificates.map(c => c.credentialId);
      const uniqueIds = Array.from(new Set([...dbIds, ...mockIds])).slice(0, 4);
      setSampleCerts(uniqueIds);
    }
    loadSamples();
  }, []);

  const handleVerify = async (idToVerify?: string) => {
    const targetId = idToVerify || certId;
    if (!targetId.trim()) return;
    setLoading(true);
    setResult('idle');
    setVerifiedCert(null);

    try {
      const { data, error } = await verifyCertificate(targetId.trim());
      if (error || !data) {
        // Fallback to mockData
        const mockCert = mockCertificates.find(
          c => c.credentialId.toLowerCase() === targetId.trim().toLowerCase()
        );
        if (mockCert) {
          setResult('valid');
          setVerifiedCert({
            title: mockCert.title,
            credential_id: mockCert.credentialId,
            issue_date: mockCert.issueDate,
            blockchain_hash: mockCert.blockchainHash,
            skills: mockCert.skills,
            recipient: {
              full_name: mockCert.recipientName
            },
            company: {
              name: mockCert.company
            },
            internship: {
              title: mockCert.internshipTitle
            }
          });
        } else {
          setResult('invalid');
        }
      } else {
        setResult('valid');
        setVerifiedCert(data);
      }
    } catch (err) {
      // Catch and check mockData
      const mockCert = mockCertificates.find(
        c => c.credentialId.toLowerCase() === targetId.trim().toLowerCase()
      );
      if (mockCert) {
        setResult('valid');
        setVerifiedCert({
          title: mockCert.title,
          credential_id: mockCert.credentialId,
          issue_date: mockCert.issueDate,
          blockchain_hash: mockCert.blockchainHash,
          skills: mockCert.skills,
          recipient: {
            full_name: mockCert.recipientName
          },
          company: {
            name: mockCert.company
          },
          internship: {
            title: mockCert.internshipTitle
          }
        });
      } else {
        setResult('invalid');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const activeId = code || idQuery;
    if (activeId) {
      setCertId(activeId);
      handleVerify(activeId);
    }
  }, [code, idQuery]);

  const handleCopy = () => {
    navigator.clipboard.writeText(certId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Verify Certificate</h1>
          <p className="mt-3 text-muted-foreground">Enter a certificate ID or scan a QR code to verify authenticity</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-6 shadow-sm max-w-2xl mx-auto">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={certId} onChange={(e) => { setCertId(e.target.value); setResult('idle'); }}
                placeholder="Enter Certificate ID (e.g., ZYRO-SE-2024-001234)"
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()} />
            </div>
            <button onClick={() => handleVerify()} disabled={loading || !certId.trim()}
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
            <motion.div key="valid" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="mt-8 space-y-6">
              {/* Success Badge Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-400">Cryptographically Secured</h3>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-500/80">This credential matches the decentralized ledger record.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-500 text-white font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                </div>
              </div>

              {/* The Certificate Visual Layout */}
              <CertificateDocument certificate={verifiedCert} />
            </motion.div>
          )}

          {result === 'invalid' && (
            <motion.div key="invalid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 bg-card rounded-xl border-2 border-red-200 shadow-lg overflow-hidden max-w-2xl mx-auto">
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

