-- =============================================
-- Migration 023: Saved Internships and Company Ratings
-- Idempotent — safe to re-run
-- =============================================

-- ─── 1. saved_internships ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.saved_internships (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  internship_id   uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, internship_id)
);

ALTER TABLE public.saved_internships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies so the script is safe to re-run
DROP POLICY IF EXISTS "Users can view their own saved internships"   ON public.saved_internships;
DROP POLICY IF EXISTS "Users can save internships for themselves"    ON public.saved_internships;
DROP POLICY IF EXISTS "Users can remove their own saved internships" ON public.saved_internships;

CREATE POLICY "Users can view their own saved internships"
  ON public.saved_internships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save internships for themselves"
  ON public.saved_internships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own saved internships"
  ON public.saved_internships FOR DELETE
  USING (auth.uid() = user_id);


-- ─── 2. company_ratings ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.company_ratings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id      uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rating          int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id)
);

ALTER TABLE public.company_ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view company ratings"          ON public.company_ratings;
DROP POLICY IF EXISTS "Authenticated users can rate companies"  ON public.company_ratings;
DROP POLICY IF EXISTS "Users can update their own ratings"      ON public.company_ratings;
DROP POLICY IF EXISTS "Users can delete their own ratings"      ON public.company_ratings;

CREATE POLICY "Anyone can view company ratings"
  ON public.company_ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can rate companies"
  ON public.company_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.company_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.company_ratings FOR DELETE
  USING (auth.uid() = user_id);


-- ─── 3. Auto-aggregate trigger ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_company_aggregate_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.companies
  SET
    rating = COALESCE(
      (SELECT ROUND(AVG(rating)::numeric, 2)
         FROM public.company_ratings
        WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)),
      0
    ),
    review_count = (
      SELECT COUNT(*)
        FROM public.company_ratings
       WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
    )
  WHERE id = COALESCE(NEW.company_id, OLD.company_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger first so CREATE OR REPLACE on the function doesn't conflict
DROP TRIGGER IF EXISTS company_ratings_changed ON public.company_ratings;

CREATE TRIGGER company_ratings_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.company_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_company_aggregate_rating();
