-- Migration 065: remove anonymous read access to offer letters.
-- The public /verify-offer flow was removed, so nothing needs anonymous
-- SELECT on offer_letters any more. The previous policy exposed student
-- email, stipend and internal notes to anyone holding the anon key.
-- Student / company / admin reads are still covered by their own policies.

DROP POLICY IF EXISTS "Offer letters: public read" ON public.offer_letters;
