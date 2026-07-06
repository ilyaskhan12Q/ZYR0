import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Bell, Lock, Eye, EyeOff, Globe, Moon, Sun, Monitor, Shield } from 'lucide-react';

export default function CompanySettings() {
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    emailApps: true, emailTasks: true, emailMessages: true,
    pushApps: true, pushTasks: true, pushMessages: true,
    theme: 'system' as 'light' | 'dark' | 'system',
    twoFactor: false, publicProfile: true,
  });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const Toggle = ({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-2">
      <div><p className="text-sm font-medium">{label}</p>{desc && <p className="text-xs text-muted-foreground">{desc}</p>}</div>
      <button onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-accent' : 'bg-muted'}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-sm text-muted-foreground mt-1">Manage your company account</p></div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90">
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-1">
        <h3 className="font-semibold mb-3">Notifications</h3>
        <Toggle label="New Applications" desc="Get notified when someone applies" checked={settings.emailApps} onChange={(v) => setSettings({ ...settings, emailApps: v })} />
        <div className="border-t border-border" />
        <Toggle label="Task Submissions" desc="Get notified on task submissions" checked={settings.emailTasks} onChange={(v) => setSettings({ ...settings, emailTasks: v })} />
        <div className="border-t border-border" />
        <Toggle label="Messages" desc="Get notified on new messages" checked={settings.emailMessages} onChange={(v) => setSettings({ ...settings, emailMessages: v })} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold">Appearance</h3>
        <div className="grid grid-cols-3 gap-3">
          {[{ value: 'light' as const, icon: Sun, label: 'Light' }, { value: 'dark' as const, icon: Moon, label: 'Dark' }, { value: 'system' as const, icon: Monitor, label: 'System' }].map(t => (
            <button key={t.value} onClick={() => setSettings({ ...settings, theme: t.value })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${settings.theme === t.value ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}>
              <t.icon className="w-6 h-6" /><span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-semibold">Security</h3>
        <Toggle label="Two-Factor Authentication" desc="Add extra security" checked={settings.twoFactor} onChange={(v) => setSettings({ ...settings, twoFactor: v })} />
        <div className="border-t border-border pt-4">
          <label className="text-sm font-medium mb-1.5 block">Change Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type={showPass ? 'text' : 'password'} placeholder="New password"
              className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20" />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPass ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
