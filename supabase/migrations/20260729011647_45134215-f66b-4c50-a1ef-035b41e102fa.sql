
-- ============ ENUM + roles ============
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ updated_at helper ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ products ============
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  unit text NOT NULL DEFAULT 'ریال / کیلوگرم',
  origin text NOT NULL DEFAULT '',
  grade text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  priority int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "products_admin_write" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ price_history ============
CREATE TABLE public.price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  date date NOT NULL,
  open bigint NOT NULL,
  high bigint NOT NULL,
  low bigint NOT NULL,
  close bigint NOT NULL,
  volume int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, date)
);
CREATE INDEX price_history_product_date_idx ON public.price_history(product_id, date DESC);
GRANT SELECT ON public.price_history TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.price_history TO authenticated;
GRANT ALL ON public.price_history TO service_role;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_history_public_read" ON public.price_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "price_history_admin_write" ON public.price_history FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ site_settings (singleton) ============
CREATE TABLE public.site_settings (
  id int PRIMARY KEY DEFAULT 1,
  brand_name text NOT NULL,
  brand_latin text NOT NULL,
  brand_tagline text NOT NULL,
  currency text NOT NULL DEFAULT 'ریال',
  hero_title text NOT NULL,
  hero_subtitle text NOT NULL,
  about_text text NOT NULL,
  contact_phone text NOT NULL,
  contact_address text NOT NULL,
  contact_email text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_settings_admin_write" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ contact_messages ============
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_messages_public_insert" ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 2 AND 120
    AND char_length(message) BETWEEN 3 AND 4000
    AND (phone IS NULL OR char_length(phone) <= 40)
    AND (email IS NULL OR char_length(email) <= 200)
  );
CREATE POLICY "contact_messages_admin_read" ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "contact_messages_admin_update" ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "contact_messages_admin_delete" ON public.contact_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ SEED settings ============
INSERT INTO public.site_settings (
  id, brand_name, brand_latin, brand_tagline, currency,
  hero_title, hero_subtitle, about_text,
  contact_phone, contact_address, contact_email
) VALUES (
  1,
  'درج سبز قزوین',
  'Darj Sabz · Qazvin',
  'درج سبز؛ مرجع قیمت خلال پسته قزوین از سال ۱۳۴۸',
  'ریال',
  'بازار خلال پسته، اصیل و شفاف',
  'درج سبز قزوین، تابلوی رسمی قیمت خلال پسته قزوین و بویین را با نمودارهای حرفه‌ای و تاریخچه‌ی دقیق در اختیار تجار، قنادان و صنایع قرار می‌دهد.',
  'درج سبز قزوین، حاصل چهار نسل تجربه در باغ‌های اصیل قزوین است. ما پسته‌ای را عرضه می‌کنیم که در همان زمینی روییده که پدرانمان کاشته‌اند؛ بی‌واسطه، شفاف و بر پایه‌ی اعتمادی که مهم‌ترین سرمایه‌ی ماست. مأموریت ما، حفظ اصالت طعم و صداقت در قیمت است.',
  '۰۲۸-۳۳۳۳۳۳۳۳',
  'قزوین، خیابان طالقانی، بازار خشکبار، پلاک ۱۲',
  'info@darjsabz.example'
);

-- ============ SEED products ============
INSERT INTO public.products (slug, name, category, unit, origin, grade, description, priority, active, featured) VALUES
('khelal-peste-qazvin','خلال پسته قزوین','پسته','ریال / کیلوگرم','قزوین','ممتاز','خلال پسته قزوین با رنگ سبز طبیعی، عطر ملایم و برش یکنواخت؛ برگزیده باغ‌های اصیل قزوین.',100,true,true),
('khelal-peste-boein','خلال پسته بویین‌زهرا','پسته','ریال / کیلوگرم','بویین‌زهرا','درجه یک','خلال پسته بویین با مغز پرمایه و رنگ زیتونی روشن؛ انتخابی متعادل برای قنادی و صنایع.',90,true,true),
('peste-akbari','پسته اکبری','پسته','ریال / کیلوگرم','رفسنجان','درشت','پسته اکبری با دانه‌های بلند و مغز پر؛ نماد کیفیت صادراتی ایران.',80,true,false),
('peste-fandoghi','پسته فندقی','پسته','ریال / کیلوگرم','کرمان','درجه یک','پسته فندقی گرد و ترد؛ پرمصرف‌ترین رقم بازار داخلی و مبنای شاخص قیمت.',75,true,false),
('magz-peste','مغز پسته سبز','پسته','ریال / کیلوگرم','قزوین','ممتاز','مغز پسته سبز پوست‌کنده، رنگ ثابت و مغز کامل؛ کاربرد لوکس در قنادی.',70,true,false),
('khelal-badam-derakhti','خلال بادام درختی','بادام درختی','ریال / کیلوگرم','سامان','درجه یک','خلال بادام درختی سفید و یکدست، مناسب شیرینی‌پزی سنتی و مدرن.',60,true,false),
('perak-badam-derakhti','پرک بادام درختی','بادام درختی','ریال / کیلوگرم','سامان','درجه یک','پرک بادام درختی با ضخامت یکنواخت؛ بافتی ترد و طعمی اصیل.',55,true,false),
('khelal-badam-zamini-doroshte','خلال بادام زمینی درشت','بادام زمینی','ریال / کیلوگرم','کردستان','درشت','خلال بادام زمینی درشت، تفت‌داده متعادل؛ مناسب آجیل و تزیین.',40,true,false),
('perak-badam-zamini','پرک بادام زمینی','بادام زمینی','ریال / کیلوگرم','کردستان','درجه یک','پرک بادام زمینی با برش نازک و طعم ملایم؛ کاربرد گسترده در صنایع.',35,true,false);

-- ============ SEED 180 days OHLC per product ============
-- Deterministic pseudo-random walk anchored to a target base price.
DO $$
DECLARE
  p RECORD;
  base bigint;
  seed bigint;
  d int;
  s bigint;
  rnd float;
  drift float;
  target float;
  open_v float;
  close_v float;
  high_v float;
  low_v float;
  wick float;
  vol int;
  dt date;
BEGIN
  FOR p IN SELECT id, slug FROM public.products LOOP
    -- base prices per slug
    base := CASE p.slug
      WHEN 'khelal-peste-qazvin' THEN 58500000
      WHEN 'khelal-peste-boein' THEN 53200000
      WHEN 'peste-akbari' THEN 12500000
      WHEN 'peste-fandoghi' THEN 10890000
      WHEN 'magz-peste' THEN 42000000
      WHEN 'khelal-badam-derakhti' THEN 21400000
      WHEN 'perak-badam-derakhti' THEN 21000000
      WHEN 'khelal-badam-zamini-doroshte' THEN 5600000
      WHEN 'perak-badam-zamini' THEN 5500000
      ELSE 10000000
    END;
    seed := ((hashtext(p.slug)::bigint % 1000 + 1000) % 1000)::int + 1;
    s := seed;
    close_v := base * 0.88;
    FOR d IN REVERSE 179..0 LOOP
      s := (s * 9301 + 49297) % 233280;
      rnd := s::float / 233280.0;
      drift := (rnd - 0.48) * 0.028;
      target := base * (1 + sin(d::float / 22.0) * 0.05);
      open_v := close_v;
      close_v := open_v * (1 + drift) + (target - open_v) * 0.06;
      wick := greatest(base, close_v) * (0.006 + rnd * 0.018);
      high_v := greatest(open_v, close_v) + wick * rnd;
      low_v := least(open_v, close_v) - wick * rnd;
      vol := 120 + floor(rnd * 380)::int + floor(abs(drift) * 4000)::int;
      dt := (current_date - d);
      -- pin last row (d=0) to base price
      IF d = 0 THEN
        close_v := base;
        high_v := greatest(high_v, base);
        low_v := least(low_v, base);
      END IF;
      INSERT INTO public.price_history (product_id, date, open, high, low, close, volume)
      VALUES (
        p.id, dt,
        (round(open_v/1000)*1000)::bigint,
        (round(high_v/1000)*1000)::bigint,
        (round(low_v/1000)*1000)::bigint,
        (round(close_v/1000)*1000)::bigint,
        vol
      );
    END LOOP;
  END LOOP;
END $$;
