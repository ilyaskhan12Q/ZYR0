-- =============================================
-- Migration 023: Saved Internships and Company Ratings
-- =============================================

-- 1. Create saved_internships table
CREATE TABLE IF NOT EXISTS public.saved_internships (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  internship_id   uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, internship_id)
);

-- Enable RLS for saved_internships
ALTER TABLE public.saved_internships ENABLE ROW LEVEL SECURITY;

-- Policies for saved_internships
CREATE POLICY "Users can view their own saved internships"
  ON public.saved_internships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save internships for themselves"
  ON public.saved_internships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own saved internships"
  ON public.saved_internships FOR DELETE
  USING (auth.uid() = user_id);


-- 2. Create company_ratings table
CREATE TABLE IF NOT EXISTS public.company_ratings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id      uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rating          int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id)
);

-- Enable RLS for company_ratings
ALTER TABLE public.company_ratings ENABLE ROW LEVEL SECURITY;

-- Policies for company_ratings
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


-- 3. Trigger to automatically update company average rating & review count
CREATE OR REPLACE FUNCTION public.update_company_aggregate_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.companies
  SET 
    rating = COALESCE(
      (SELECT ROUND(AVG(rating)::numeric, 2) FROM public.company_ratings WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)),
      0
    ),
    review_count = (SELECT COUNT(*) FROM public.company_ratings WHERE company_id = COALESCE(NEW.company_id, OLD.company_id))
  WHERE id = COALESCE(NEW.company_id, OLD.company_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER company_ratings_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.company_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_company_aggregate_rating();
