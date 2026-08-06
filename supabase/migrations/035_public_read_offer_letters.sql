-- Migration 035: Public offer-letter verification for the /verify-offer/:id page.
-- The QR code printed on every offer letter points to /verify-offer/:id, so
-- anonymous users must be able to read a single offer record by id.
-- All statuses are readable so verifiers see the true state of the offer
-- (the document renders its own Revoked / Rejected / Accepted watermark);
-- edits and deletes remain restricted to student / company / admin policies.

alter table public.offer_letters enable row level security;

drop policy if exists "Offer letters: public read" on public.offer_letters;

create policy "Offer letters: public read"
  on public.offer_letters for select
  using (true);
