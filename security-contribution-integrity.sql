-- Contributors may edit their own pledge, not move it to a different gift or identity.
CREATE OR REPLACE FUNCTION public.enforce_contribution_identity()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF auth.role() = 'authenticated' AND (
    NEW.id IS DISTINCT FROM OLD.id OR NEW.gift_id IS DISTINCT FROM OLD.gift_id OR
    NEW.contributor_id IS DISTINCT FROM OLD.contributor_id OR NEW.created_at IS DISTINCT FROM OLD.created_at
  ) THEN
    RAISE EXCEPTION 'Contribution identity cannot be changed' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS enforce_contribution_identity ON public.gift_contributions;
CREATE TRIGGER enforce_contribution_identity BEFORE UPDATE ON public.gift_contributions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_contribution_identity();
