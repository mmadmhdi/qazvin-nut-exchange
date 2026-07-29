
-- 1) Purge all fabricated historical price rows.
TRUNCATE TABLE public.price_history;

-- 2) Remove the auto-admin-on-first-signup trigger and function.
DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap_admin ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_bootstrap_admin() CASCADE;

-- 3) Safe first-admin onboarding: authenticated user can claim the admin role
--    ONLY while no admin exists. After the first admin is set, this RPC becomes
--    inert and further admin grants must go through an existing admin.
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'admin')
  ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

-- 4) Anti-spam rate limits on contact_messages.
CREATE OR REPLACE FUNCTION public.enforce_contact_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hourly_global int;
  per_contact int;
  dupe_recent int;
BEGIN
  SELECT count(*) INTO hourly_global
    FROM public.contact_messages
    WHERE created_at > now() - interval '1 hour';
  IF hourly_global >= 30 THEN
    RAISE EXCEPTION 'rate_limited_global' USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.phone IS NOT NULL OR NEW.email IS NOT NULL THEN
    SELECT count(*) INTO per_contact
      FROM public.contact_messages
      WHERE created_at > now() - interval '1 hour'
        AND (
          (NEW.phone IS NOT NULL AND phone = NEW.phone)
          OR (NEW.email IS NOT NULL AND email = NEW.email)
        );
    IF per_contact >= 3 THEN
      RAISE EXCEPTION 'rate_limited_contact' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  SELECT count(*) INTO dupe_recent
    FROM public.contact_messages
    WHERE created_at > now() - interval '10 minutes'
      AND name = NEW.name
      AND message = NEW.message;
  IF dupe_recent > 0 THEN
    RAISE EXCEPTION 'duplicate_recent_message' USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contact_messages_rate_limit ON public.contact_messages;
CREATE TRIGGER contact_messages_rate_limit
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.enforce_contact_rate_limit();
