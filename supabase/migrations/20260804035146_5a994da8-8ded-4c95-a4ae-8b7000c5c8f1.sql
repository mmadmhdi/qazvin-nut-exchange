ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS price bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS passport jsonb;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS contact_whatsapp text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS telegram text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS working_hours text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS founded_year text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS mission_text text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS export_text text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS announcement text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS price_source text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS site_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS wholesale_tiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS wholesale_benefits jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  dek text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'market',
  date date NOT NULL DEFAULT CURRENT_DATE,
  minutes integer NOT NULL DEFAULT 5,
  tags text[] NOT NULL DEFAULT '{}',
  body text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "articles_public_read" ON public.articles
  FOR SELECT TO anon, authenticated USING (published = true);

CREATE POLICY "articles_admin_write" ON public.articles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER articles_set_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  ok boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_login_attempts_ip_time
  ON public.admin_login_attempts (ip, created_at DESC);

GRANT ALL ON public.admin_login_attempts TO service_role;

ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;