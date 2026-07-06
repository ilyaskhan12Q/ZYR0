import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, ExternalLink, Shield, Calendar, Building2, QrCode, Loader2 } from 'lucide-react';
import { getMyCertificates } from '@/services/certificates';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentCertificates() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCertificates() {
      try {
        const { data } = await getMyCertificates();
        if (data) {
          setCerts(data);
        }
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
              className="bg-card rounded-xl border border-border shadow-md overflow-hidden hover:shadow-lg transition-all">
              {/* Certificate Preview */}
              <div className="bg-gradient-to-br from-primary via-primary to-accent p-8 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold">{cert.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{cert.company?.name || 'Company'}</p>
                  <p className="text-white/60 text-xs mt-3 font-mono">{cert.credential_id}</p>
                </div>
              </div>

              {/* Details */}
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(cert.issue_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">{cert.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{cert.internship?.title || 'Internship'}</span>
                  </div>
                  {cert.blockchain_hash && (
                    <div className="flex items-center gap-2 text-sm">
                      <QrCode className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-xs truncate" title={cert.blockchain_hash}>
                        {cert.blockchain_hash.slice(0, 12)}...
                      </span>
                    </div>
                  )}
                </div>

                {cert.skills && cert.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cert.skills.map((s: string, j: number) => (
                        <span key={j} className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <a href={`/verify?id=${cert.credential_id}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                    <ExternalLink className="w-4 h-4" /> Verify Credential
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
