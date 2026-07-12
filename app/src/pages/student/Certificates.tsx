import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Share2, ExternalLink, Shield, Calendar, Building2, QrCode, Loader2, X, Eye } from 'lucide-react';
import { getMyCertificates } from '@/services/certificates';
import { useAuth } from '@/contexts/AuthContext';
import { certificates as mockCertificates } from '@/data/mockData';
import CertificateDocument from '@/components/CertificateDocument';

export default function StudentCertificates() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  useEffect(() => {
    async function loadCertificates() {
      try {
        const { data } = await getMyCertificates();
        let list = data || [];
        
        // If DB has no certificates, pre-load mock certificates for Alex Johnson or demo purposes
        if (list.length === 0) {
          const userName = user?.user_metadata?.full_name || 'Alex Johnson';
          const filteredMocks = mockCertificates.filter(
            c => c.recipientName.toLowerCase() === userName.toLowerCase()
          );
          
          list = (filteredMocks.length > 0 ? filteredMocks : mockCertificates).map(c => ({
            id: c.id,
            title: c.title,
            credential_id: c.credentialId,
            issue_date: c.issueDate,
            blockchain_hash: c.blockchainHash,
            skills: c.skills,
            status: c.status,
            recipient: {
              full_name: c.recipientName
            },
            company: {
              name: c.company
            },
            internship: {
              title: c.internshipTitle
            }
          }));
        }
        setCerts(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadCertificates();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Certificates</h1>
        <p className="text-sm text-muted-foreground mt-1">Verified credentials earned through your internships</p>
      </div>

      {certs.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border text-muted-foreground">
          No certificates earned yet. Keep up the good work!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certs.map((cert, i) => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                {/* Certificate Preview Card Header */}
                <div className="bg-gradient-to-br from-primary via-primary to-accent dark:from-slate-900 dark:via-slate-950 dark:to-accent/50 p-6 text-white text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold line-clamp-1">{cert.title}</h3>
                    <p className="text-white/80 text-xs mt-0.5">{cert.company?.name || 'Company'}</p>
                    <p className="text-white/60 text-[10px] mt-2 font-mono">{cert.credential_id}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{new Date(cert.issue_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 font-medium">{cert.status || 'Active'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs col-span-2">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="truncate">{cert.internship?.title || 'Internship'}</span>
                    </div>
                    {cert.blockchain_hash && (
                      <div className="flex items-center gap-2 text-xs col-span-2">
                        <QrCode className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-mono text-[10px] truncate" title={cert.blockchain_hash}>
                          Hash: {cert.blockchain_hash.slice(0, 16)}...
                        </span>
                      </div>
                    )}
                  </div>

                  {cert.skills && cert.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1.5">Earned Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cert.skills.map((s: string, j: number) => (
                          <span key={j} className="px-2 py-0.5 bg-accent/5 border border-accent/10 text-accent text-[10px] rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 flex gap-2">
                <button onClick={() => setSelectedCert(cert)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors">
                  <Eye className="w-3.5 h-3.5" /> View Certificate
                </button>
                <a href={`/verify?id=${cert.credential_id}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent/90 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Public Link
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modern High-Fidelity Preview Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl bg-card rounded-2xl border border-border shadow-2xl overflow-y-auto max-h-[90vh] p-6 sm:p-8">
              
              <button onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-20">
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <h2 className="text-xl font-bold">Credential Details</h2>
                <p className="text-xs text-muted-foreground">Print or save your digital certificate of completion</p>
              </div>

              <div className="mt-6">
                <CertificateDocument certificate={selectedCert} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

