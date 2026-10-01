import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface BlogCodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

export function BlogCodeBlock({ children, className }: BlogCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract raw string content for clipboard
  const codeString = String(children || '').replace(/\n$/, '');

  // Detect language if specified (e.g. language-typescript)
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code snippet:', err);
    }
  };

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-border/70 bg-[#0F141C] text-slate-100 shadow-sm">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#171E2B] border-b border-border/40 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </span>
          {language && (
            <span className="uppercase text-[11px] font-semibold text-slate-300 ml-2 tracking-wider">
              {language}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Code snippet copied' : 'Copy code snippet'}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-mono cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed selection:bg-primary/30">
        <code>{children}</code>
      </div>
    </div>
  );
}
