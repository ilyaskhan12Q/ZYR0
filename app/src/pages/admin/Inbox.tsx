import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Inbox, Loader2, Mail, RefreshCw, Search, Eye, Check, Reply,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { ContactMessage, ContactMessageStatus } from '@/lib/database.types';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const tabs: ('All' | ContactMessageStatus)[] = ['All', 'new', 'read', 'replied'];

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  read: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  replied: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
};

const categoryLabel: Record<string, string> = {
  general: 'General',
  support: 'Support',
  partnership: 'Partnership',
  feedback: 'Feedback',
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminInbox() {
  const [activeTab, setActiveTab] = useState<'All' | ContactMessageStatus>('All');
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ContactMessage | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (activeTab !== 'All') query = query.eq('status', activeTab);
      const { data, error } = await query;
      if (error) throw error;
      setMessages((data as ContactMessage[]) || []);
    } catch (err) {
      console.error('Error loading contact messages:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) =>
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q)
    );
  }, [messages, search]);

  const unreadCount = messages.filter((m) => m.status === 'new').length;

  const openDetail = (m: ContactMessage) => {
    setDetail(m);
    if (m.status === 'new') {
      supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', m.id)
        .then(() => loadMessages());
    }
  };

  const markReplied = async (id: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'replied' })
        .eq('id', id);
      if (error) throw error;
      setDetail((prev) => (prev && prev.id === id ? { ...prev, status: 'replied' } : prev));
      loadMessages();
    } catch (err) {
      console.error('Error updating contact message status:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Messages from the public contact form{unreadCount > 0 ? ` — ${unreadCount} unread` : ''}.
          </p>
        </div>
        <button
          type="button"
          onClick={loadMessages}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-card border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-colors',
              activeTab === tab
                ? 'bg-accent text-white border-accent'
                : 'bg-card border-border text-muted-foreground hover:bg-muted'
            )}
          >
            {tab === 'All' ? 'All' : tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages..."
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus-visible-ring"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl py-20 text-center">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No messages yet.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Submissions from the contact form will appear here.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => openDetail(m)}
                className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  m.status === 'new' ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'
                )}>
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{m.name}</p>
                    {m.status === 'new' && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" aria-label="Unread" />}
                    <span className="text-xs text-muted-foreground truncate">{m.email}</span>
                  </div>
                  <p className="text-sm text-foreground mt-0.5 truncate">
                    <span className="text-muted-foreground">[{categoryLabel[m.category] || m.category}] </span>
                    {m.subject || '(no subject)'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.message}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">{formatDateTime(m.created_at)}</p>
                  <span className={cn('inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-medium', statusColors[m.status])}>
                    {m.status[0].toUpperCase() + m.status.slice(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message from {detail?.name}</DialogTitle>
            <DialogDescription>
              {detail?.email} · {detail ? formatDateTime(detail.created_at) : ''}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-0.5 text-xs rounded-full font-medium bg-muted text-muted-foreground">
                  {categoryLabel[detail.category] || detail.category}
                </span>
                <span className={cn('px-2.5 py-0.5 text-xs rounded-full font-medium', statusColors[detail.status])}>
                  {detail.status[0].toUpperCase() + detail.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold">{detail.subject || '(no subject)'}</p>
                <p className="text-sm text-foreground mt-3 whitespace-pre-wrap leading-relaxed">{detail.message}</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
                <a
                  href={`mailto:${detail.email}?subject=Re: ${encodeURIComponent(detail.subject || 'Your ZYR0 inquiry')}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <Reply className="w-4 h-4" /> Reply to {detail.email}
                </a>
                <button
                  type="button"
                  disabled={updating || detail.status === 'replied'}
                  onClick={() => markReplied(detail.id)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {detail.status === 'replied' ? 'Marked replied' : 'Mark as replied'}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
