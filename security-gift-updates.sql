-- Public reservation updates may change only reservation fields, never gift content.
CREATE OR REPLACE FUNCTION public.enforce_gift_update_permissions()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  -- Maintenance/service connections and the actual wishlist owner retain their existing permissions.
  IF auth.role() IS DISTINCT FROM 'authenticated' OR EXISTS (
    SELECT 1 FROM public.wishlists w WHERE w.id = OLD.wishlist_id AND w.user_id = auth.uid()
  ) THEN
    RETURN NEW;
  END IF;

  IF (to_jsonb(NEW) - ARRAY['is_reserved', 'reserved_by', 'reserved_at', 'updated_at'])
     IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['is_reserved', 'reserved_by', 'reserved_at', 'updated_at']) THEN
    RAISE EXCEPTION 'Only the wishlist owner may edit gift details' USING ERRCODE = '42501';
  END IF;

  -- Funding updates originate from the contribution trigger, not from a client request.
  IF pg_trigger_depth() > 1 AND OLD.is_group_gift AND NOT COALESCE(OLD.is_reserved, false)
     AND NEW.is_reserved IS TRUE AND NEW.reserved_by IS NOT DISTINCT FROM OLD.reserved_by
     AND public.is_gift_fully_funded(OLD.id) THEN
    NEW.reserved_at := now();
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF NOT OLD.is_group_gift AND NOT COALESCE(OLD.is_reserved, false)
     AND NEW.is_reserved IS TRUE AND NEW.reserved_by = auth.uid() THEN
    NEW.reserved_at := now();
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF NOT OLD.is_group_gift AND OLD.is_reserved IS TRUE AND OLD.reserved_by = auth.uid()
     AND NEW.is_reserved IS FALSE AND NEW.reserved_by IS NULL THEN
    NEW.reserved_at := NULL;
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Reservation change not permitted' USING ERRCODE = '42501';
END;
$$;
DROP TRIGGER IF EXISTS enforce_gift_update_permissions ON public.gifts;
CREATE TRIGGER enforce_gift_update_permissions BEFORE UPDATE ON public.gifts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_gift_update_permissions();
