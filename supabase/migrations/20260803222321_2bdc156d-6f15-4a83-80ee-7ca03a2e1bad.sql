DROP FUNCTION IF EXISTS public.claim_first_admin();
REVOKE EXECUTE ON FUNCTION public.enforce_contact_rate_limit() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_contact_rate_limit() FROM authenticated;