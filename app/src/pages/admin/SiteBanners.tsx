import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Megaphone, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  createSiteBanner, deleteSiteBanner, getAllSiteBanners, toggleSiteBanner, updateSiteBanner,
} from '@/services/siteBanners';
import type { SiteBanner } from '@/lib/database.types';

const emptyForm = {
  title: '',
  message: '',
  link_url: '',
  link_label: '',
  is_active: true,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SiteBanners() {
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [editing, setEditing] = useState<SiteBanner | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SiteBanner | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      setBanners(await getAllSiteBanners());
    } catch (err) {
      console.error(err);
      setMessage({ type: 'err', text: 'Failed to load banners.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const openCreate = () => {
    setForm({ ...emptyForm });
    setCreating(true);
    setMessage(null);
  };

  const openEdit = (banner: SiteBanner) => {
    setForm({
      title: banner.title,
      message: banner.message,
      link_url: banner.link_url ?? '',
      link_label: banner.link_label ?? '',
      is_active: banner.is_active,
    });
    setEditing(banner);
    setMessage(null);
  };

  const save = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      setMessage({ type: 'err', text: 'Title and message are required.' });
      return;
    }
    setBusy('save');
    const payload = {
      title: form.title.trim(),
      message: form.message.trim(),
      link_url: form.link_url.trim() || null,
      link_label: form.link_label.trim() || null,
      is_active: form.is_active,
      starts_at: null,
      ends_at: null,
    };
    try {
      if (editing) {
        await updateSiteBanner(editing.id, payload);
        setMessage({ type: 'ok', text: 'Banner updated.' });
      } else {
        await createSiteBanner(payload);
        setMessage({ type: 'ok', text: 'Banner created.' });
      }
      setEditing(null);
      setCreating(false);
      loadBanners();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'err', text: 'Failed to save banner.' });
    } finally {
      setBusy(null);
    }
  };

  const handleToggle = async (banner: SiteBanner) => {
    try {
      await toggleSiteBanner(banner.id, !banner.is_active);
      loadBanners();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'err', text: 'Failed to update banner.' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy('delete');
    try {
      await deleteSiteBanner(deleteTarget.id);
      setMessage({ type: 'ok', text: 'Banner deleted.' });
      setDeleteTarget(null);
      loadBanners();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'err', text: 'Failed to delete banner.' });
    } finally {
      setBusy(null);
    }
  };

  const activeCount = banners.filter((b) => b.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Site Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Announcement bars shown at the top of every public page — e.g. maintenance notices.
            {activeCount > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium"> {activeCount} active.</span>
            ) : (
              <span className="text-muted-foreground"> None active.</span>
            )}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Banner
        </button>
      </div>

      {message && (
        <div
          className={cn(
            'px-4 py-3 rounded-lg border text-sm',
            message.type === 'ok'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300'
          )}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          No banners yet. Create one to show an announcement site-wide.
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <motion.div
              key={banner.id}
              layout
              className={cn(
                'bg-card border rounded-xl p-4 sm:p-5',
                banner.is_active ? 'border-emerald-500/40' : 'border-border opacity-75'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      onClick={() => handleToggle(banner)}
                      role="switch"
                      aria-checked={banner.is_active}
                      className={cn(
                        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer flex-shrink-0',
                        banner.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                          banner.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]'
                        )}
                      />
                    </span>
                    <h3 className="font-semibold text-sm truncate">{banner.title}</h3>
                    <span
                      className={cn(
                        'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                        banner.is_active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      )}
                    >
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{banner.message}</p>
                  {banner.link_label && (
                    <p className="text-xs text-muted-foreground mt-1">
                      CTA: <span className="text-accent font-medium">{banner.link_label}</span>
                      {banner.link_url ? ` → ${banner.link_url}` : ''}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Created {formatDate(banner.created_at)}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(banner)}
                    title="Edit banner"
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(banner)}
                    title="Delete banner"
                    className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={creating || editing !== null} onOpenChange={(open) => {
        if (!open) {
          setCreating(false);
          setEditing(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Banner' : 'New Banner'}</DialogTitle>
            <DialogDescription>
              This bar appears at the top of every public page while active.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Scheduled Maintenance"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                placeholder="ZYR0 is undergoing scheduled maintenance. If you run into any issues, reach out — our team is here to help."
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Link Label</label>
                <input
                  value={form.link_label}
                  onChange={(e) => setForm({ ...form, link_label: e.target.value })}
                  placeholder="Contact us"
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Link URL</label>
                <input
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://chat.whatsapp.com/…"
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              If left blank, the CTA falls back to the WhatsApp support group. When active, the
              banner shows immediately.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => { setCreating(false); setEditing(null); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={save}
              disabled={busy === 'save'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
              {editing ? 'Save Changes' : 'Create Banner'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this banner?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be removed permanently and disappears from
              all public pages immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy === 'delete'}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={busy === 'delete'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {busy === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
