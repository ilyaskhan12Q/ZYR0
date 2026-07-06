import { motion } from 'framer-motion';
import { Award, Download, Share2, ExternalLink, Shield, Calendar, Building2, QrCode } from 'lucide-react';
import { certificates } from '@/data/mockData';

export default function StudentCertificates() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Certificates</h1>
        <p className="text-sm text-muted-foreground mt-1">Verified credentials earned through your internships</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certificates.map((cert, i) => (
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
                <p className="text-white/80 text-sm mt-1">{cert.company}</p>
                <p className="text-white/60 text-xs mt-3 font-mono">{cert.credentialId}</p>
              </div>
            </div>

            {/* Details */}
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">Verified</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>{cert.internshipTitle}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <QrCode className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{cert.blockchainHash.slice(0, 12)}...</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {cert.skills.map((s, j) => (
                    <span key={j} className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                  <Download className="w-4 h-4" /> Download
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors px-4">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors px-4">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
