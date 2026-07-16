import { useState, useEffect, useCallback } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  rateCompany,
  getUserRatingForCompany,
  deleteUserRatingForCompany,
} from '@/services/companies';

interface CompanyRatingWidgetProps {
  companyId: string;
  /** Current average rating from DB (used as display baseline) */
  currentAvgRating: number;
  /** Current total review count from DB */
  currentReviewCount: number;
  className?: string;
}

export function CompanyRatingWidget({
  companyId,
  currentAvgRating,
  currentReviewCount,
  className = '',
}: CompanyRatingWidgetProps) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [authed, setAuthed] = useState(false);

  // Optimistic display values
  const [displayAvg, setDisplayAvg] = useState(currentAvgRating);
  const [displayCount, setDisplayCount] = useState(currentReviewCount);

  useEffect(() => {
    setDisplayAvg(currentAvgRating);
    setDisplayCount(currentReviewCount);
  }, [currentAvgRating, currentReviewCount]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!user) { setLoading(false); return; }
      setAuthed(true);
      const rating = await getUserRatingForCompany(companyId);
      if (mounted) {
        setUserRating(rating);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [companyId]);

  const handleRate = useCallback(async (star: number) => {
    if (!authed) {
      toast.error('Sign in to rate companies');
      return;
    }
    if (mutating) return;

    const prevRating = userRating;
    const isSameRating = prevRating === star;

    // Optimistic update
    const prevAvg = displayAvg;
    const prevCount = displayCount;

    if (isSameRating) {
      // Removing rating
      setUserRating(null);
      if (displayCount > 1) {
        const newAvg = (displayAvg * displayCount - star) / (displayCount - 1);
        setDisplayAvg(Math.round(newAvg * 10) / 10);
        setDisplayCount(displayCount - 1);
      } else {
        setDisplayAvg(0);
        setDisplayCount(0);
      }
    } else if (prevRating === null) {
      // New rating
      setUserRating(star);
      const newAvg = (displayAvg * displayCount + star) / (displayCount + 1);
      setDisplayAvg(Math.round(newAvg * 10) / 10);
      setDisplayCount(displayCount + 1);
    } else {
      // Update existing rating
      setUserRating(star);
      const newAvg = (displayAvg * displayCount - prevRating + star) / displayCount;
      setDisplayAvg(Math.round(newAvg * 10) / 10);
    }

    setMutating(true);
    try {
      if (isSameRating) {
        const { error } = await deleteUserRatingForCompany(companyId);
        if (error) throw error;
        toast.success('Rating removed');
      } else {
        const { error } = await rateCompany(companyId, star);
        if (error) throw error;
        toast.success(prevRating ? 'Rating updated!' : 'Thanks for your rating!');
      }
    } catch {
      // Rollback
      setUserRating(prevRating);
      setDisplayAvg(prevAvg);
      setDisplayCount(prevCount);
      toast.error('Could not save rating. Try again.');
    } finally {
      setMutating(false);
    }
  }, [authed, mutating, userRating, companyId, displayAvg, displayCount]);

  const starsToShow = hovered || userRating || 0;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Average display */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(s => (
            <Star
              key={s}
              className={`w-4 h-4 ${
                s <= Math.round(displayAvg)
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-muted-foreground'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold">
          {displayAvg > 0 ? displayAvg.toFixed(1) : '—'}
        </span>
        <span className="text-xs text-muted-foreground">
          ({displayCount} {displayCount === 1 ? 'review' : 'reviews'})
        </span>
      </div>

      {/* User rating input */}
      {loading ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading your rating…
        </div>
      ) : !authed ? (
        <p className="text-xs text-muted-foreground">
          <a href="/login" className="text-accent hover:underline">Sign in</a> to rate this company
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">
            {userRating ? `Your rating: ${userRating}/5 (click to change or remove)` : 'Rate this company:'}
          </p>
          <div
            className="flex items-center gap-0.5"
            onMouseLeave={() => setHovered(0)}
            role="group"
            aria-label="Rate this company"
          >
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                disabled={mutating}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHovered(star)}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                className="p-0.5 transition-transform hover:scale-125 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    star <= starsToShow
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-muted-foreground hover:text-yellow-400'
                  }`}
                />
              </button>
            ))}
            {mutating && <Loader2 className="w-4 h-4 animate-spin ml-2 text-muted-foreground" />}
          </div>
        </div>
      )}
    </div>
  );
}
