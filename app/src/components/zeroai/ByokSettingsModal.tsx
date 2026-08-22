import { useState } from 'react';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { PROVIDER_META, type ProviderId, type ZeroAiKeys } from '@/hooks/useZeroAiKeys';

interface ByokSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keys: ZeroAiKeys;
  masked: (provider: ProviderId) => string;
  onSave: (provider: ProviderId, value: string) => void;
  onClearAll: () => void;
}

const PROVIDER_ORDER: ProviderId[] = ['gemini', 'openai', 'anthropic'];

export function ByokSettingsModal({ open, onOpenChange, keys, masked, onSave, onClearAll }: ByokSettingsModalProps) {
  const [drafts, setDrafts] = useState<Partial<Record<ProviderId, string>>>({});
  const [show, setShow] = useState<Partial<Record<ProviderId, boolean>>>({});

  const commit = () => {
    for (const provider of PROVIDER_ORDER) {
      const value = drafts[provider];
      if (value !== undefined) {
        onSave(provider, value);
      }
    }
    setDrafts({});
    setShow({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <KeyRound className="size-4 text-primary" /> API Keys — Bring Your Own
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Keys are stored <strong>only in this browser</strong> (localStorage). Phase 1 is mock —
            no request ever leaves your machine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5">
          {PROVIDER_ORDER.map((provider) => {
            const meta = PROVIDER_META[provider];
            const isConfigured = Boolean(keys[provider]);
            const draftValue = drafts[provider] ?? '';
            return (
              <div key={provider} className="rounded-xl border p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: isConfigured ? meta.color : 'transparent', boxShadow: isConfigured ? `0 0 8px ${meta.color}66` : 'none' }}
                      aria-hidden="true"
                    />
                    <Label htmlFor={`za-key-${provider}`} className="text-xs font-semibold">
                      {meta.label}
                    </Label>
                  </div>
                  <span
                    className={cn(
                      'za-mono rounded-full border px-2 py-0.5 text-[9px] tracking-widest',
                      isConfigured ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'text-muted-foreground/70'
                    )}
                  >
                    {isConfigured ? `SET · ${masked(provider)}` : 'EMPTY'}
                  </span>
                </div>
                <div className="relative mt-2.5">
                  <Input
                    id={`za-key-${provider}`}
                    type={show[provider] ? 'text' : 'password'}
                    value={draftValue}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [provider]: e.target.value }))}
                    placeholder={isConfigured && !draftValue ? masked(provider) : `Paste ${meta.label} API key…`}
                    autoComplete="off"
                    spellCheck={false}
                    className="za-mono pr-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((prev) => ({ ...prev, [provider]: !prev[provider] }))}
                    aria-label={show[provider] ? 'Hide key' : 'Show key'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    {show[provider] ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-destructive hover:text-destructive"
            onClick={onClearAll}
            disabled={!Object.values(keys).some(Boolean)}
          >
            <ShieldCheck className="size-3.5" /> Clear all keys
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={commit} className="text-xs">
              Save locally
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}