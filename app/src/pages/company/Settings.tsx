import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Lock, Eye, EyeOff, Moon, Sun, Monitor, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

export default function CompanySettings() {
  const { setTheme } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [password, setPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [settings, setSettings] = useState(() => {
    const savedData = localStorage.getItem('zyro_company_settings');
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
      pushApps: true,
      pushTasks: true,
      pushMessages: true,
      theme: 'system' as 'light' | 'dark' | 'system',
      twoFactor: false,
      publicProfile: true,
    };
  });

  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, setTheme]);

  const handleSave = async () => {
    try {
      localStorage.setItem('zyro_company_settings', JSON.stringify(settings));
      
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
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your company account preferences</p>
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-1"
      >
        <h3 className="font-semibold mb-3">Notifications</h3>
        <Toggle
          label="New Applications"
          desc="Get notified when someone applies to your job postings"
          checked={settings.emailApps}
          onChange={(v) => setSettings({ ...settings, emailApps: v })}
        />
        <div className="border-t border-border" />
        <Toggle
          label="Task Submissions"
          desc="Get notified when an intern submits a task for review"
          checked={settings.emailTasks}
          onChange={(v) => setSettings({ ...settings, emailTasks: v })}
        />
        <div className="border-t border-border" />
        <Toggle
          label="Messages"
          desc="Get notified when you receive a message from interns or team members"
          checked={settings.emailMessages}
          onChange={(v) => setSettings({ ...settings, emailMessages: v })}
        />
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4"
      >
        <h3 className="font-semibold">Appearance</h3>
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
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4"
      >
        <h3 className="font-semibold">Security</h3>
        <Toggle
          label="Two-Factor Authentication"
          desc="Add an extra layer of security to your company account"
          checked={settings.twoFactor}
          onChange={(v) => setSettings({ ...settings, twoFactor: v })}
        />
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
              {showPass ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
