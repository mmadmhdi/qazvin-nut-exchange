CREATE TABLE public.crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'ایران',
  kind text NOT NULL DEFAULT 'lead',
  source text NOT NULL DEFAULT 'website',
  tags text[] NOT NULL DEFAULT '{}',
  notes text NOT NULL DEFAULT '',
  last_contact_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_contacts TO authenticated;
GRANT ALL ON public.crm_contacts TO service_role;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY crm_contacts_admin_all ON public.crm_contacts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER crm_contacts_set_updated_at BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.crm_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  title text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity_kg numeric NOT NULL DEFAULT 0,
  unit_price bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ریال',
  stage text NOT NULL DEFAULT 'new',
  probability integer NOT NULL DEFAULT 20,
  expected_close date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_deals TO authenticated;
GRANT ALL ON public.crm_deals TO service_role;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY crm_deals_admin_all ON public.crm_deals FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER crm_deals_set_updated_at BEFORE UPDATE ON public.crm_deals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.crm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'note',
  body text NOT NULL DEFAULT '',
  due_at timestamptz,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_activities TO authenticated;
GRANT ALL ON public.crm_activities TO service_role;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY crm_activities_admin_all ON public.crm_activities FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS crm_contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL;

CREATE INDEX crm_deals_stage_idx ON public.crm_deals(stage);
CREATE INDEX crm_activities_contact_idx ON public.crm_activities(contact_id);
CREATE INDEX crm_contacts_kind_idx ON public.crm_contacts(kind);