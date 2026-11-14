import React, { useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';
import { copyToClipboard } from '@/lib/clipboard';

function nodeText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (React.isValidElement(node)) return nodeText((node.props as { children?: React.ReactNode }).children);
  return '';
}

function codeLanguage(children: React.ReactNode): string {
  const first = Array.isArray(children) ? children[0] : children;
  if (!React.isValidElement(first)) return 'code';
  const className = (first.props as { className?: string }).className || '';
  return /language-([\w-]+)/.exec(className)?.[1] || 'code';
}

function CodeBlock({ children }: { children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const text = nodeText(children).replace(/\n$/, '');
  const language = codeLanguage(children);

  const handleCopy = async () => {
    if (!(await copyToClipboard(text))) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="group my-4 overflow-hidden rounded-xl border border-neutral-800 bg-[#0d1117]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label={copied ? 'Copied code' : 'Copy code'}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed text-neutral-100">{children}</pre>
    </div>
  );
}

const components: Components = {
  h1: ({ node: _node, ...props }) => <h2 {...props} />,
  h2: ({ node: _node, ...props }) => <h3 {...props} />,
  h3: ({ node: _node, ...props }) => <h4 {...props} />,
  h4: ({ node: _node, ...props }) => <h5 {...props} />,
  h5: ({ node: _node, ...props }) => <h6 {...props} />,
  h6: ({ node: _node, ...props }) => <h6 {...props} />,
  pre: ({ node: _node, children }) => <CodeBlock>{children}</CodeBlock>,
  table: ({ node: _node, ...props }) => (
    <div className="zyro-table-wrap my-4 w-full overflow-x-auto rounded-lg border border-border/60">
      <table {...props} />
    </div>
  ),
  a: ({ node: _node, href, ...props }) => (
    <a
      {...props}
      href={href}
      {...(/^https?:\/\//i.test(href || '') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    />
  ),
  img: ({ node: _node, alt, ...props }) => (
    <img {...props} alt={alt || ''} loading="lazy" decoding="async" />
  ),
};

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Shared renderer for listing descriptions (editor preview, listing preview, public page).
 * Raw HTML is not rendered; react-markdown escapes it. rehype-highlight only decorates code.
 */
export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  if (!content.trim()) return null;
  return (
    <div className={`zyro-markdown ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
