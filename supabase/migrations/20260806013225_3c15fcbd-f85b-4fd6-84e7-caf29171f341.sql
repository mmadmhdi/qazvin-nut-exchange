-- Explicit, least-privilege policies for operational/PII tables.
-- Server-side (service role) writes continue to bypass RLS.

-- contact_messages: admin-only read, admin-only status updates, no anon access.
GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
REVOKE ALL ON public.contact_messages FROM anon;

DROP POLICY IF EXISTS contact_messages_admin_read ON public.contact_messages;
CREATE POLICY contact_messages_admin_read ON public.contact_messages
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS contact_messages_admin_update ON public.contact_messages;
CREATE POLICY contact_messages_admin_update ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Operational / audit tables: admin-only read, writes only via trusted server role.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'admin_access_attempts',
    'admin_audit_log',
    'admin_login_attempts',
    'public_rate_limit_events',
    'content_assertions',
    'site_state'
  ]
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_read', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.has_role(auth.uid(), ''admin''::app_role))',
      t || '_admin_read', t);
  END LOOP;
END $$;