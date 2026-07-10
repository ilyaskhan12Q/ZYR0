import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Moon, Sun, Monitor, Save, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5"
    >
      <h3 className="font-semibold">{title}</h3>
      {children}
    </motion.div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-accent' : 'bg-muted'}`}
      >
        <span
          className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function MentorSettings() {
  const { setTheme } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [password, setPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [settings, setSettings] = useState(() => {
    const savedData = localStorage.getItem('zyro_mentor_settings');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        // ignore and fallback
      }
    }
    return {
      emailApps: true,
      emailTasks: true,
      emailMessages: true,
      emailEvaluations: true,
      smsApps: false,
      smsTasks: false,
      smsMessages: false,
      smsEvaluations: false,
      phoneNumber: '',
      theme: 'system' as 'light' | 'dark' | 'system',
      language: 'en',
      twoFactor: false,
    };
  });

  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, setTheme]);

  const handleSave = async () => {
    try {
      localStorage.setItem('zyro_mentor_settings', JSON.stringify(settings));
      
      if (password) {
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters long');
          return;
        }
        setUpdatingPassword(true);
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword('');
        toast.success('Password updated successfully!');
      }

      setSaved(true);
      toast.success('Settings saved successfully!');
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mentor Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your notification and account preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updatingPassword}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {updatingPassword ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Notifications */}
      <Section title="Notifications">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Email Notifications</h4>
              <Toggle label="Intern Applications" desc="Get notified when new student applications are submitted" checked={settings.emailApps} onChange={(v) => setSettings({ ...settings, emailApps: v })} />
              <Toggle label="Task Submissions" desc="Get notified when interns submit completed tasks" checked={settings.emailTasks} onChange={(v) => setSettings({ ...settings, emailTasks: v })} />
              <Toggle label="New Messages" desc="Get notified when interns or colleagues message you" checked={settings.emailMessages} onChange={(v) => setSettings({ ...settings, emailMessages: v })} />
              <Toggle label="Evaluation Deadlines" desc="Get reminded before intermediate or final evaluations are due" checked={settings.emailEvaluations} onChange={(v) => setSettings({ ...settings, emailEvaluations: v })} />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">SMS Alerts</h4>
              <Toggle label="Application SMS Alerts" desc="Receive urgent SMS alerts for new applications" checked={settings.smsApps} onChange={(v) => setSettings({ ...settings, smsApps: v })} />
              <Toggle label="Task Submission SMS" desc="Receive SMS alerts for critical task submissions" checked={settings.smsTasks} onChange={(v) => setSettings({ ...settings, smsTasks: v })} />
              <Toggle label="New Messages SMS" desc="Receive SMS alerts for direct messages" checked={settings.smsMessages} onChange={(v) => setSettings({ ...settings, smsMessages: v })} />
              
              <div className="pt-2">
                <label className="text-xs text-muted-foreground mb-1 block">Primary Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={settings.phoneNumber}
                  onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light' as const, icon: Sun, label: 'Light' },
            { value: 'dark' as const, icon: Moon, label: 'Dark' },
            { value: 'system' as const, icon: Monitor, label: 'System' },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setSettings({ ...settings, theme: t.value })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                settings.theme === t.value ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
              }`}
            >
              <t.icon className="w-6 h-6" />
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section title="Security">
        <div className="space-y-4">
          <div className="border-t border-border pt-4">
            <label className="text-sm font-medium mb-1.5 block">Change Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPass(!showPass);
                }} 
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPass
                  ? <EyeOff className="w-4 h-4 text-muted-foreground" />
                  : <Eye className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          </div>
          <Toggle label="Two-Factor Authentication" desc="Add an extra layer of security to your mentor account" checked={settings.twoFactor} onChange={(v) => setSettings({ ...settings, twoFactor: v })} />
        </div>
      </Section>
    </div>
  );
}
