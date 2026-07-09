-- =============================================
-- Migration 018: Sync Offer Letter Status to Application
-- Automatically synchronizes the application status
-- when a student accepts, rejects, or a company
-- revokes/expires an offer letter.
-- =============================================

CREATE OR REPLACE FUNCTION public.sync_offer_letter_status_to_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Only execute if status has changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'Accepted' THEN
      -- Update the linked application to 'Accepted'
      UPDATE public.applications
      SET status = 'Accepted',
          updated_at = now()
      WHERE id = NEW.application_id;

      -- Automatically mark other active applications for this student as 'Rejected'
      -- since they have accepted this placement offer.
      UPDATE public.applications
      SET status = 'Rejected',
          updated_at = now()
      WHERE student_id = NEW.student_id
        AND id != NEW.application_id
        AND status IN ('Applied', 'Under Review', 'Shortlisted');

    ELSIF NEW.status = 'Rejected' THEN
      UPDATE public.applications
      SET status = 'Rejected',
          updated_at = now()
      WHERE id = NEW.application_id;

    ELSIF NEW.status = 'Revoked' THEN
      UPDATE public.applications
      SET status = 'Rejected',
          updated_at = now()
      WHERE id = NEW.application_id;

    ELSIF NEW.status = 'Expired' THEN
      UPDATE public.applications
      SET status = 'Rejected',
          updated_at = now()
      WHERE id = NEW.application_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync status changes on update
DROP TRIGGER IF EXISTS on_offer_letter_status_update ON public.offer_letters;
CREATE TRIGGER on_offer_letter_status_update
  AFTER UPDATE OF status ON public.offer_letters
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_offer_letter_status_to_application();
