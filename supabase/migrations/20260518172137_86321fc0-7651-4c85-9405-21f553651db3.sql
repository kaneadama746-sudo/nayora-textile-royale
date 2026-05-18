
-- CATEGORIES
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER categories_set_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- COLORS
CREATE TABLE public.colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  hex TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Colors public read" ON public.colors FOR SELECT USING (true);
CREATE POLICY "Admins manage colors" ON public.colors FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER colors_set_updated_at BEFORE UPDATE ON public.colors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FABRICS
CREATE TABLE public.fabrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  colors TEXT[] NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fabrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fabrics public read" ON public.fabrics FOR SELECT USING (true);
CREATE POLICY "Admins manage fabrics" ON public.fabrics FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER fabrics_set_updated_at BEFORE UPDATE ON public.fabrics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SITE SETTINGS (clé/valeur)
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER settings_set_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SEED categories
INSERT INTO public.categories (name, slug, position) VALUES
  ('Wax', 'wax', 1),
  ('Bazin', 'bazin', 2),
  ('Brodé', 'brode', 3);

-- SEED colors
INSERT INTO public.colors (name, hex, position) VALUES
  ('Bleu nuit', '#0b1e3f', 1),
  ('Doré', '#c9a84c', 2),
  ('Blanc', '#f5f3ee', 3),
  ('Noir', '#0d0d0d', 4),
  ('Rouge', '#b91c1c', 5),
  ('Vert', '#15803d', 6),
  ('Jaune', '#eab308', 7),
  ('Orange', '#ea580c', 8),
  ('Rose', '#db2777', 9),
  ('Violet', '#7c3aed', 10),
  ('Marron', '#78350f', 11),
  ('Beige', '#d6c7a8', 12),
  ('Turquoise', '#14b8a6', 13),
  ('Bordeaux', '#7f1d1d', 14);

-- SEED fabrics
INSERT INTO public.fabrics (name, description, category_id, colors, position) VALUES
  ('Wax Hittaguet', 'Tissu wax aux motifs vibrants, parfait pour vos tenues du quotidien.', (SELECT id FROM public.categories WHERE slug='wax'), ARRAY['Bleu nuit','Rouge','Jaune','Vert','Orange','Noir'], 1),
  ('Wax Hollandaise', 'L''authentique wax hollandais, qualité supérieure et couleurs éclatantes.', (SELECT id FROM public.categories WHERE slug='wax'), ARRAY['Bleu nuit','Rouge','Vert','Jaune','Rose','Turquoise'], 2),
  ('Bazin Riche', 'Le tissu noble par excellence, idéal pour les grandes occasions.', (SELECT id FROM public.categories WHERE slug='bazin'), ARRAY['Doré','Bleu nuit','Blanc','Bordeaux','Violet','Vert'], 3),
  ('Bazin Gold VIP', 'Notre gamme prestige, brillance et raffinement absolus.', (SELECT id FROM public.categories WHERE slug='bazin'), ARRAY['Doré','Blanc','Noir','Bleu nuit','Bordeaux'], 4),
  ('Bazin Simple', 'Élégance accessible pour toutes vos confections.', (SELECT id FROM public.categories WHERE slug='bazin'), ARRAY['Blanc','Beige','Bleu nuit','Rose','Vert','Jaune'], 5),
  ('Brodé Simple', 'Broderies fines et délicates, finition soignée.', (SELECT id FROM public.categories WHERE slug='brode'), ARRAY['Blanc','Beige','Bleu nuit','Doré'], 6),
  ('Brodé Unisexe', 'Une collection moderne pensée pour homme et femme.', (SELECT id FROM public.categories WHERE slug='brode'), ARRAY['Bleu nuit','Noir','Blanc','Marron','Beige'], 7),
  ('Brodé de la Mode', 'Les dernières tendances brodées de la saison.', (SELECT id FROM public.categories WHERE slug='brode'), ARRAY['Doré','Rose','Violet','Turquoise','Bordeaux','Bleu nuit'], 8);

-- SEED site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('site', '{"name":"NAYORA","tagline":"Maison de Tissus · Dakar","heroTitle":"L''excellence textile","heroAccent":"pour toutes vos exigences","heroDesc":"NAYORA vous propose une sélection raffinée de Wax, Bazin et Brodés pour sublimer chaque occasion. La tradition africaine, magnifiée.","aboutTitle":"La maison de référence du textile à Dakar","aboutText":"Implantée au cœur du Marché HLM 5, NAYORA incarne l''élégance et la qualité au service des familles, couturiers et professionnels. Nous sélectionnons chaque pièce pour son authenticité, sa tenue et sa beauté."}'::jsonb),
  ('contact', '{"phones":["+221787945050","+221787974040"],"phoneLabels":["78 794 50 50","78 797 40 40"],"email":"nayora797@gmail.com","address":"Marché HLM 5, Dakar — Sénégal","instagram":""}'::jsonb);
