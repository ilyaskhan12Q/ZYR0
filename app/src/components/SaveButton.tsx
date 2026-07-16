import { useState, useEffect, useCallback } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  saveInternship,
  unsaveInternship,
  isInternshipSaved,
} from '@/services/internships';

interface SaveButtonProps {
  internshipId: string;
  /** Compact mode: icon only, no text */
  compact?: boolean;
  className?: string;
}

export function SaveButton({ internshipId, compact = false, className = '' }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [authed, setAuthed] = useState(false);

  // Load initial state
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!user) { setLoading(false); return; }
      setAuthed(true);
      const result = await isInternshipSaved(internshipId);
      if (mounted) {
        setSaved(result);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [internshipId]);

  const toggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authed) {
      toast.error('Sign in to save internships');
      return;
    }
    if (mutating) return;

    // Optimistic update
    const prev = saved;
    setSaved(!prev);
    setMutating(true);

    try {
      if (prev) {
        const { error } = await unsaveInternship(internshipId);
        if (error) throw error;
        toast.success('Removed from saved');
      } else {
        const { error } = await saveInternship(internshipId);
        if (error) throw error;
        toast.success('Saved!');
      }
    } catch {
      setSaved(prev); // rollback
      toast.error('Something went wrong. Try again.');
    } finally {
      setMutating(false);
    }
  }, [authed, mutating, saved, internshipId]);

  if (loading) {
    return (
      <button
        disabled
        aria-label="Loading save state"
        className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground ${className}`}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        {!compact && <span>Save</span>}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={mutating}
      aria-label={saved ? 'Unsave internship' : 'Save internship'}
      aria-pressed={saved}
      className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
        saved
          ? 'text-accent font-medium'
          : 'text-muted-foreground hover:text-foreground'
      } disabled:opacity-50 ${className}`}
    >
      {mutating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="w-4 h-4 fill-current" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {!compact && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
