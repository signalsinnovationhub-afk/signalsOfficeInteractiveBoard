
-- quiz_results
CREATE TABLE public.quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  score integer NOT NULL,
  total integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "results readable by all" ON public.quiz_results FOR SELECT USING (true);
CREATE POLICY "results insertable by all" ON public.quiz_results FOR INSERT WITH CHECK (true);
CREATE POLICY "results deletable by admin" ON public.quiz_results FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE INDEX idx_quiz_results_score ON public.quiz_results (score DESC, created_at ASC);
CREATE INDEX idx_quiz_results_created ON public.quiz_results (created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_results;

-- media_tiles
CREATE TABLE public.media_tiles (
  slot text PRIMARY KEY,
  source_type text NOT NULL CHECK (source_type IN ('upload','url')),
  storage_path text,
  external_url text,
  poster_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.media_tiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media readable by all" ON public.media_tiles FOR SELECT USING (true);
CREATE POLICY "media insert admin" ON public.media_tiles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "media update admin" ON public.media_tiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER media_tiles_touch BEFORE UPDATE ON public.media_tiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
INSERT INTO public.media_tiles (slot, source_type, external_url) VALUES
  ('welcome', 'url', ''),
  ('bottom', 'url', '');

-- app_settings
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings readable by all" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "settings insert admin" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "settings update admin" ON public.app_settings FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER app_settings_touch BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
INSERT INTO public.app_settings (key, value) VALUES
  ('quiz_idle_timeout_sec', '30'::jsonb),
  ('quiz_countdown_sec', '10'::jsonb),
  ('quiz_finish_return_sec', '8'::jsonb);

-- storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
  ON CONFLICT (id) DO NOTHING;
CREATE POLICY "media public read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "media admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "media admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND has_role(auth.uid(), 'admin'));
