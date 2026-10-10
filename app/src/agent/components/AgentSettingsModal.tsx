'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import {
  Check,
  Cpu,
  Database,
  Download,
  Eraser,
  Info,
  LogOut,
  Moon,
  RotateCcw,
  SlidersHorizontal,
  Sun,
  Telescope,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import type { AgentModelInfo } from '@/agent/core/types';
import type { ResearchDepth } from '@/agent/research/types';
import type { AgentMode, AgentTheme } from '@/agent/lib/preferences';

/**
 * ChatGPT-style settings sheet: a modal with a section rail on the left and
 * labelled rows (title + description + control) on the right. Every control
 * here is wired to a real piece of workspace state — preferences persist in
 * localStorage via `@/agent/lib/preferences`, the plan-review switch drives
 * the pipeline hook, model selection drives the gateway, and the data-control
 * buttons export/delete actual conversations.
 */

type SectionId = 'general' | 'research' | 'model' | 'data' | 'account' | 'about';

const SECTIONS: { id: SectionId; label: string; icon: typeof SlidersHorizontal }[] = [
  { id: 'general', label: 'General', icon: SlidersHorizontal },
  { id: 'research', label: 'Research', icon: Telescope },
  { id: 'model', label: 'Model', icon: Cpu },
  { id: 'data', label: 'Data controls', icon: Database },
  { id: 'account', label: 'Account', icon: User },
  { id: 'about', label: 'About', icon: Info },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--ag-text-6)]">
      {children}
    </h3>
  );
}

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/5 px-3 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-sm text-[var(--ag-text)]">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--ag-text-5)]">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 px-3 py-3.5 last:border-b-0">
      <span className="text-sm text-[var(--ag-text)]">{label}</span>
      <span className="text-right text-xs text-[var(--ag-text-4)]">{value}</span>
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: React.ReactNode }[];
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-0.5 rounded-lg border border-white/10 bg-[var(--ag-track)] p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
            value === option.value
              ? 'bg-white/10 text-white'
              : 'text-[var(--ag-text-4)] hover:text-white'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  children,
  variant = 'secondary',
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'secondary' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'danger'
          ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-300'
          : 'border-white/10 bg-white/5 text-[var(--ag-text-2)] hover:border-white/20 hover:bg-white/10 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function ModelRadioRow({
  active,
  title,
  subtitle,
  badge,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
        active ? 'bg-white/[0.07] ring-1 ring-white/10' : 'hover:bg-white/5'
      )}
    >
      <span
        className={cn(
          'grid size-4 shrink-0 place-items-center rounded-full border transition-colors',
          active ? 'border-[#1488fc]' : 'border-[var(--ag-line)]'
        )}
      >
        {active && <span className="size-2 rounded-full bg-[#1488fc]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm text-[var(--ag-text)]">{title}</span>
          {badge && (
            <span className="shrink-0 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
              {badge}
            </span>
          )}
        </span>
        <span className="block truncate text-xs text-[var(--ag-text-5)]">{subtitle}</span>
      </span>
      {active && <Check className="size-4 shrink-0 text-[#1488fc]" aria-hidden="true" />}
    </button>
  );
}

export interface AgentSettingsModalProps {
  onClose: () => void;
  // Appearance (light is the workspace default)
  theme: AgentTheme;
  onThemeChange: (theme: AgentTheme) => void;
  // Preferences (persisted through the page's handlers)
  defaultMode: AgentMode;
  onDefaultModeChange: (mode: AgentMode) => void;
  startTemporary: boolean;
  onStartTemporaryChange: (value: boolean) => void;
  depth: ResearchDepth;
  onDepthChange: (depth: ResearchDepth) => void;
  skipReview: boolean;
  onSkipReviewChange: (value: boolean) => void;
  onRestoreDefaults: () => void;
  // Model
  models: AgentModelInfo[];
  modelsLoading: boolean;
  selectedModel: string | null;
  onSelectModel: (id: string | null) => void;
  // Data controls
  canExport: boolean;
  onExport: () => void;
  onClearConversation: () => void;
  onDeleteAllHistory: () => Promise<void>;
}

export function AgentSettingsModal({
  onClose,
  theme,
  onThemeChange,
  defaultMode,
  onDefaultModeChange,
  startTemporary,
  onStartTemporaryChange,
  depth,
  onDepthChange,
  skipReview,
  onSkipReviewChange,
  onRestoreDefaults,
  models,
  modelsLoading,
  selectedModel,
  onSelectModel,
  canExport,
  onExport,
  onClearConversation,
  onDeleteAllHistory,
}: AgentSettingsModalProps) {
  const { user, profile, signOut } = useAuth();
  const [section, setSection] = useState<SectionId>('general');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Escape unwinds one layer at a time: the delete confirmation first,
  // then the sheet itself — and never mid-delete.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (confirmingDelete) {
        if (!deleting) setConfirmingDelete(false);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, confirmingDelete, deleting]);

  const enabledModels = models.filter((model) => model.enabled);
  const activeModel = enabledModels.find((model) => model.id === selectedModel) ?? null;

  const name = profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Researcher';
  const email = profile?.email || user?.email || 'Unknown account';
  const provider = (user?.app_metadata?.provider as string | undefined) || 'email';
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const handleDeleteAll = async () => {
    setDeleting(true);
    setDeleteFailed(false);
    try {
      await onDeleteAllHistory();
      setConfirmingDelete(false);
    } catch {
      // Stay on the confirm step so the user can retry.
      setDeleteFailed(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.success('Signed out');
    } catch {
      toast.error("Couldn't sign out — try again");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <m.div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
      />

      {/* Sheet */}
      <m.div
        initial={{ opacity: 0, y: 10, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-[min(640px,90vh)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--ag-surface)] shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
      >
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-5">
          <span className="text-sm font-medium text-white">Settings</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="grid size-8 place-items-center rounded-full text-[var(--ag-text-4)] transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          {/* Section rail — horizontal tabs on mobile */}
          <nav
            className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 p-2 sm:w-52 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:p-3"
            data-lenis-prevent=""
            aria-label="Settings sections"
          >
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                aria-current={section === item.id ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors',
                  section === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-[var(--ag-text-4)] hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Content pane */}
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4"
            data-lenis-prevent=""
          >
            {section === 'general' && (
              <>
                <SectionHeading>General</SectionHeading>
                <Row
                  title="Theme"
                  description="Switch the whole workspace between light and dark."
                >
                  <Segmented<AgentTheme>
                    label="Theme"
                    value={theme}
                    onChange={onThemeChange}
                    options={[
                      {
                        value: 'light',
                        label: (
                          <span className="inline-flex items-center gap-1.5">
                            <Sun className="size-3" aria-hidden="true" />
                            Light
                          </span>
                        ),
                      },
                      {
                        value: 'dark',
                        label: (
                          <span className="inline-flex items-center gap-1.5">
                            <Moon className="size-3" aria-hidden="true" />
                            Dark
                          </span>
                        ),
                      },
                    ]}
                  />
                </Row>
                <Row
                  title="Default chat mode"
                  description="Which mode a new conversation opens in."
                >
                  <Segmented<AgentMode>
                    label="Default chat mode"
                    value={defaultMode}
                    onChange={onDefaultModeChange}
                    options={[
                      { value: 'chat', label: 'Chat' },
                      { value: 'research', label: 'Research' },
                    ]}
                  />
                </Row>
                <Row
                  title="Start new chats in temporary mode"
                  description="New conversations won't be saved to your history."
                >
                  <Switch
                    checked={startTemporary}
                    onCheckedChange={onStartTemporaryChange}
                    aria-label="Start new chats in temporary mode"
                    className="h-5 w-9"
                  />
                </Row>
                <Row
                  title="Restore defaults"
                  description="Reset everything on this page — theme, mode, temporary, depth, plan review and model — and apply it now."
                >
                  <ActionButton onClick={onRestoreDefaults}>
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    Restore defaults
                  </ActionButton>
                </Row>
              </>
            )}

            {section === 'research' && (
              <>
                <SectionHeading>Research</SectionHeading>
                <Row
                  title="Default research depth"
                  description="How much work a research run does before it answers."
                >
                  <Segmented<ResearchDepth>
                    label="Default research depth"
                    value={depth}
                    onChange={onDepthChange}
                    options={[
                      { value: 'quick', label: 'Quick' },
                      { value: 'standard', label: 'Standard' },
                      { value: 'deep', label: 'Deep' },
                    ]}
                  />
                </Row>
                <Row
                  title="Run plans automatically"
                  description="Skip the plan-review step so research starts immediately. Turn this off to approve the plan first."
                >
                  <Switch
                    checked={skipReview}
                    onCheckedChange={onSkipReviewChange}
                    aria-label="Run plans automatically"
                    className="h-5 w-9"
                  />
                </Row>
              </>
            )}

            {section === 'model' && (
              <>
                <SectionHeading>Default model</SectionHeading>
                <div className="px-1 pt-1">
                  <p className="px-3 pb-2 text-xs text-[var(--ag-text-5)]">
                    The model used for new messages, and what the composer starts with.
                  </p>
                  <ModelRadioRow
                    active={selectedModel === null}
                    title="Auto"
                    subtitle="Fastest available model"
                    onClick={() => onSelectModel(null)}
                  />
                  {modelsLoading && (
                    <p className="flex items-center gap-2 px-3 py-3 text-xs text-[var(--ag-text-6)]">
                      <span className="size-3 shrink-0 animate-spin rounded-full border-2 border-[var(--ag-text-6)] border-t-transparent" />
                      Loading models…
                    </p>
                  )}
                  {!modelsLoading && enabledModels.length === 0 && (
                    <p className="px-3 py-3 text-xs text-[var(--ag-text-6)]">
                      No models are available right now — the gateway may be offline.
                    </p>
                  )}
                  {enabledModels.map((model) => (
                    <ModelRadioRow
                      key={model.id}
                      active={selectedModel === model.id}
                      title={model.name}
                      subtitle={`${model.provider} · ${Math.round(model.context / 1000)}k context · $${model.inputPricePer1M}/M in`}
                      badge={model.tier === 'free' ? 'Free' : undefined}
                      onClick={() => onSelectModel(model.id)}
                    />
                  ))}
                  {activeModel && (
                    <p className="mt-2 px-3 text-[11px] text-[var(--ag-text-6)]">
                      ${activeModel.outputPricePer1M}/M output · {activeModel.tier} tier
                    </p>
                  )}
                </div>
              </>
            )}

            {section === 'data' && (
              <>
                <SectionHeading>Data controls</SectionHeading>
                <Row
                  title="Export conversation"
                  description="Download this thread — and any finished report — as a Markdown file."
                >
                  <ActionButton onClick={onExport} disabled={!canExport}>
                    <Download className="size-3.5" aria-hidden="true" />
                    Export
                  </ActionButton>
                </Row>
                <Row
                  title="Clear this conversation"
                  description="Start a fresh thread. Everything already saved stays in your history."
                >
                  <ActionButton onClick={onClearConversation}>
                    <Eraser className="size-3.5" aria-hidden="true" />
                    Clear
                  </ActionButton>
                </Row>
                <Row
                  title="Delete all chat history"
                  description="Permanently remove every saved conversation and research report from this account."
                >
                  <ActionButton variant="danger" onClick={() => setConfirmingDelete(true)}>
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    Delete all
                  </ActionButton>
                </Row>
              </>
            )}

            {section === 'account' && (
              <>
                <SectionHeading>Account</SectionHeading>
                <div className="flex items-center gap-3 border-b border-white/5 px-3 py-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1488fc] to-[#8b5cf6] text-sm font-semibold text-[#ffffff]">
                    {initials || '?'}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white">{name}</span>
                    <span className="block truncate text-xs text-[var(--ag-text-5)]">{email}</span>
                  </span>
                </div>
                <InfoRow label="Signed in with" value={provider} />
                <Row
                  title="Sign out"
                  description="End this session on the current device."
                >
                  <ActionButton onClick={handleSignOut} disabled={signingOut}>
                    {signingOut ? (
                      <span className="size-3 shrink-0 animate-spin rounded-full border-2 border-[var(--ag-text-4)] border-t-transparent" />
                    ) : (
                      <LogOut className="size-3.5" aria-hidden="true" />
                    )}
                    Sign out
                  </ActionButton>
                </Row>
              </>
            )}

            {section === 'about' && (
              <>
                <SectionHeading>About</SectionHeading>
                <InfoRow label="Workspace" value="ZYR0 Research Agent" />
                <InfoRow
                  label="Environment"
                  value={import.meta.env.MODE === 'production' ? 'Production' : 'Development'}
                />
                <InfoRow label="Preferences" value="Stored in this browser" />
                <InfoRow label="Chat history" value="Stored in your ZYR0 account" />
                <p className="px-3 pt-3 text-[11px] leading-relaxed text-[var(--ag-text-6)]">
                  Conversations, research reports and sources stay in your account — never in
                  temporary chats, which only live in this tab until you close it.
                </p>
              </>
            )}
          </div>
        </div>
      </m.div>

      {/* Delete-all confirmation popup — layered above the sheet */}
      <AnimatePresence>
        {confirmingDelete && (
          <m.div
            key="delete-confirm"
            className="absolute inset-0 z-20 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-history-title"
            aria-describedby="delete-history-body"
          >
            <button
              type="button"
              aria-label="Close confirmation"
              onClick={() => {
                if (!deleting) setConfirmingDelete(false);
              }}
              className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
            />
            <m.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[var(--ag-surface)] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-400">
                  <Trash2 className="size-5" aria-hidden="true" />
                </span>
                <h2 id="delete-history-title" className="text-base font-semibold text-white">
                  Delete all chat history.
                </h2>
              </div>
              <p
                id="delete-history-body"
                className="mt-3 text-sm leading-relaxed text-[var(--ag-text-4)]"
              >
                Are you sure you want to delete your history?{' '}
                <span className="font-medium text-red-400">This can't be undone.</span>
              </p>
              {deleteFailed && (
                <p className="mt-2 text-sm text-red-300">Couldn't delete — try again.</p>
              )}
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  className="rounded-lg px-3.5 py-2 text-sm text-[var(--ag-text-4)] transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAll}
                  disabled={deleting}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-[#ffffff] transition-colors hover:bg-red-500 disabled:opacity-60"
                >
                  {deleting ? (
                    <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                  ) : (
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  )}
                  {deleting ? 'Deleting…' : 'Delete everything'}
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}
