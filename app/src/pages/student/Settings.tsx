import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Moon, Sun, Monitor, Save } from 'lucide-react';

// ─── Extracted sub-components (must live OUTSIDE the parent component) ────────
// Defining components inside a render function causes React to remount them
// every time the parent re-renders, resetting local state.

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
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-accent' : 'bg-muted'}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

// ─── Main Settings Component ──────────────────────────────────────────────────

export default function StudentSettings() {
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    emailApps: true,
    emailTasks: true,
    emailMessages: true,
    emailDeadlines: true,
    pushApps: false,
    pushTasks: true,
    pushMessages: true,
    pushDeadlines: true,
    theme: 'system' as 'light' | 'dark' | 'system',
    language: 'en',
    twoFactor: false,
    publicProfile: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Notifications */}
      <Section title="Notifications">
        <div className="space-y-1">
          <Toggle label="Application Updates" desc="Get notified when your application status changes" checked={settings.emailApps} onChange={(v) => setSettings({ ...settings, emailApps: v })} />
          <div className="border-t border-border" />
          <Toggle label="Task Assignments" desc="Get notified when new tasks are assigned" checked={settings.emailTasks} onChange={(v) => setSettings({ ...settings, emailTasks: v })} />
          <div className="border-t border-border" />
          <Toggle label="New Messages" desc="Get notified when you receive a message" checked={settings.emailMessages} onChange={(v) => setSettings({ ...settings, emailMessages: v })} />
          <div className="border-t border-border" />
          <Toggle label="Deadline Reminders" desc="Get reminded before task deadlines" checked={settings.emailDeadlines} onChange={(v) => setSettings({ ...settings, emailDeadlines: v })} />
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
          <Toggle label="Two-Factor Authentication" desc="Add an extra layer of security" checked={settings.twoFactor} onChange={(v) => setSettings({ ...settings, twoFactor: v })} />
          <div className="border-t border-border pt-4">
            <label className="text-sm font-medium mb-1.5 block">Change Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="New password"
                className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPass
                  ? <EyeOff className="w-4 h-4 text-muted-foreground" />
                  : <Eye className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          </div>
          <Toggle label="Public Profile" desc="Allow others to view your portfolio" checked={settings.publicProfile} onChange={(v) => setSettings({ ...settings, publicProfile: v })} />
        </div>
      </Section>

      {/* Language & Region */}
      <Section title="Language & Region">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Language</label>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </Section>
    </div>
  );
}
