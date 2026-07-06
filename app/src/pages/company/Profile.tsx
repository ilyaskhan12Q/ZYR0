import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Globe, MapPin, Save, Plus, X, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCompany, updateCompany, createCompany, uploadCompanyLogo } from '@/services/companies';

export default function CompanyProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    size: '1-10 employees',
    industry: '',
    founded: '',
    description: '',
  });

  useEffect(() => {
    async function loadCompany() {
      try {
        const { data } = await getMyCompany();
        if (data) {
          setCompany(data);
          setForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            website: data.website || '',
            location: data.location || '',
            size: data.size || '1-10 employees',
            industry: data.industry || '',
            founded: data.founded || '',
            description: data.description || '',
          });
        }
      } catch (err: any) {
        setError('Failed to fetch company profile');
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadCompany();
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (company?.id) {
        const { data, error: err } = await updateCompany(company.id, form);
        if (err) throw err;
        setCompany(data);
      } else {
        const { data, error: err } = await createCompany(form);
        if (err) throw err;
        setCompany(data);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company?.id) return;
    setUploadingLogo(true);
    setError(null);
    try {
      const publicUrl = await uploadCompanyLogo(company.id, file);
      setCompany((prev: any) => ({ ...prev, logo_url: publicUrl }));
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Company Profile</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {/* Header / Cover Logo */}
      {company && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary to-accent relative" />
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-10 mb-4 gap-4">
              <div className="relative">
                <img
                  src={company.logo_url || `https://ui-avatars.com/api/?name=${company.name || 'Company'}`}
                  alt=""
                  className="w-20 h-20 rounded-2xl border-4 border-card shadow-lg object-cover"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center shadow-md hover:bg-accent/90 disabled:opacity-50"
                >
                  {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Basic Info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Company Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Industry</label>
            <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Company Size</label>
            <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20">
              <option>1-10 employees</option>
              <option>11-50 employees</option>
              <option>51-200 employees</option>
              <option>201-500 employees</option>
              <option>500+ employees</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Founded (Year)</label>
            <input type="text" value={form.founded} onChange={(e) => setForm({ ...form, founded: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none" />
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Website</label>
            <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
