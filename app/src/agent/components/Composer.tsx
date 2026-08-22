import { useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';

interface ComposerProps {
  streaming: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}

export function Composer({ streaming, onSend, onStop }: ComposerProps) {
  const [value, setValue] = useState('');

  const submit = () => {
    const text = value.trim();
    if (!text || streaming) return;
    onSend(text);
    setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-border bg-card/60 p-4 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-end gap-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={streaming ? 'Generating…' : 'Ask anything — Shift+Enter for newlines'}
          disabled={streaming}
          className="max-h-40 min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-60"
        />
        {streaming ? (
          <Button variant="secondary" onClick={onStop} className="h-11 shrink-0">
            Stop
          </Button>
        ) : (
          <Button onClick={submit} disabled={!value.trim()} className="h-11 shrink-0">
            Send
          </Button>
        )}
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
        Free-tier models are shared and rate-limited — the gateway falls back
        automatically when one is throttled.
      </p>
    </div>
  );
}