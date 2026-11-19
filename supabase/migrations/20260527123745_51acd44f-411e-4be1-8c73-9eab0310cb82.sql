CREATE TABLE public.ai_news (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  image_url text NOT NULL,
  article_url text NOT NULL,
  source text NOT NULL,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ai_news TO anon;
GRANT SELECT, UPDATE ON public.ai_news TO authenticated;
GRANT ALL ON public.ai_news TO service_role;

ALTER TABLE public.ai_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_news readable by all"
  ON public.ai_news FOR SELECT
  USING (true);

CREATE POLICY "ai_news update by admin"
  ON public.ai_news FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_ai_news_created_at ON public.ai_news (created_at DESC);
CREATE INDEX idx_ai_news_source_created ON public.ai_news (source, created_at DESC);