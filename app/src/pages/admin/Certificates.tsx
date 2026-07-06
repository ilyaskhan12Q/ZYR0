import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Download, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { revokeCertificate } from '@/services/certificates';

const tabs = ['All', 'Active', 'Revoked'];

export default function AdminCertificates() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCertificates() {
    try {
      let query = supabase
        .from('certificates')
        .select(`
          *,
          recipient:profiles!recipient_id (id, full_name, avatar_url),
          company:companies!company_id (id, name, logo_url)
        `)
        .order('issue_date', { ascending: false });

      if (activeTab !== 'All') {
        query = query.eq('status', activeTab);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        setCertificates(data);
      }
    } catch (err) {
      console.error('Error loading certificates:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCertificates();
  }, [activeTab]);

  const handleRevoke = async (certId: string) => {
    if (!confirm('Are you sure you want to revoke this certificate? This action is irreversible.')) {
      return;
    }
    try {
      await revokeCertificate(certId);
      setCertificates((prev) =>
        prev.map((c) => (c.id === certId ? { ...c, status: 'Revoked' } : c))
      );
    } catch (err) {
      console.error('Error revoking certificate:', err);
      alert('Failed to revoke certificate');
    }
  };

  const filtered = certificates.filter((c) => {
    const matchSearch =
      !search ||
      (c.recipient?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.credential_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.title || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Certificate Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and verify all certificates</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search certificates..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto border border-border">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{tab}</button>
          ))}
        </div>
      </div>

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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Certificate</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Recipient</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Issued</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No certificates found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((cert) => (
                    <motion.tr key={cert.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{cert.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{cert.credential_id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img src={cert.recipient?.avatar_url || `https://ui-avatars.com/api/?name=${cert.recipient?.full_name || 'User'}`} alt="" className="w-7 h-7 rounded-full object-cover" />
                          <span className="text-sm">{cert.recipient?.full_name || 'No Name Provided'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                          cert.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                        }`}>{cert.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(cert.issue_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <a
                            href={cert.pdf_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground inline-block"
                            title="View PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          {cert.status === 'Active' && (
                            <button
                              onClick={() => handleRevoke(cert.id)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500"
                              title="Revoke Certificate"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
