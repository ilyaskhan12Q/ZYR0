import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, Lock, Mail, Shield, Bell } from 'lucide-react';

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div><p className="text-sm font-medium">{label}</p>{desc && <p className="text-xs text-muted-foreground">{desc}</p>}</div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-accent' : 'bg-muted'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState(() => {
    const savedData = localStorage.getItem('zyro_admin_settings');
    if (savedData) {
      try {
        return {
          smtpHost: 'smtp.example.com',
          senderEmail: 'noreply@zyro.com',
          ...JSON.parse(savedData)
        };
      } catch (e) {
        // ignore and fallback
      }
    }
    return {
      maintenanceMode: false,
      openRegistration: true,
      requireEmailVerification: true,
      googleOAuth: true,
      linkedinOAuth: true,
      twoFactorRequired: false,
      autoBackup: true,
      analyticsEnabled: true,
      smtpHost: 'smtp.example.com',
      senderEmail: 'noreply@zyro.com',
    };
  });

  const handleSave = () => { 
    localStorage.setItem('zyro_admin_settings', JSON.stringify(settings));
    setSaved(true); 
    setTimeout(() => setSaved(false), 2000); 
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">System Settings</h1><p className="text-sm text-muted-foreground mt-1">Configure platform-wide settings</p></div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90">
          <Save className="w-4 h-4" />{saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-1">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Globe className="w-4 h-4" /> General</h3>
        <Toggle label="Maintenance Mode" desc="Put the platform in maintenance mode" checked={settings.maintenanceMode} onChange={(v) => setSettings({ ...settings, maintenanceMode: v })} />
        <div className="border-t border-border" />
        <Toggle label="Open Registration" desc="Allow new users to register" checked={settings.openRegistration} onChange={(v) => setSettings({ ...settings, openRegistration: v })} />
        <div className="border-t border-border" />
        <Toggle label="Require Email Verification" desc="Users must verify email before accessing platform" checked={settings.requireEmailVerification} onChange={(v) => setSettings({ ...settings, requireEmailVerification: v })} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-1">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Lock className="w-4 h-4" /> Authentication</h3>
        <Toggle label="Google OAuth" desc="Allow login with Google" checked={settings.googleOAuth} onChange={(v) => setSettings({ ...settings, googleOAuth: v })} />
        <div className="border-t border-border" />
        <Toggle label="LinkedIn OAuth" desc="Allow login with LinkedIn" checked={settings.linkedinOAuth} onChange={(v) => setSettings({ ...settings, linkedinOAuth: v })} />
        <div className="border-t border-border" />
        <Toggle label="Require Two-Factor Auth" desc="Enforce 2FA for all users" checked={settings.twoFactorRequired} onChange={(v) => setSettings({ ...settings, twoFactorRequired: v })} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Mail className="w-4 h-4" /> Email Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">SMTP Host</label>
            <input type="text" placeholder="smtp.example.com" value={settings.smtpHost} onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Sender Email</label>
            <input type="email" placeholder="noreply@zyro.com" value={settings.senderEmail} onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
        </div>
        <button className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Send Test Email</button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-1">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Security & Backup</h3>
        <Toggle label="Automatic Backups" desc="Daily automated database backups" checked={settings.autoBackup} onChange={(v) => setSettings({ ...settings, autoBackup: v })} />
        <div className="border-t border-border" />
        <Toggle label="Analytics Collection" desc="Collect usage analytics" checked={settings.analyticsEnabled} onChange={(v) => setSettings({ ...settings, analyticsEnabled: v })} />
      </motion.div>
    </div>
  );
}
