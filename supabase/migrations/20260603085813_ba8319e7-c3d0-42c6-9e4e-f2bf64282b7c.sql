-- 1. Make image_url nullable so manually created news without image is allowed
ALTER TABLE public.ai_news ALTER COLUMN image_url DROP NOT NULL;

-- 2. Add updated_at column + trigger
ALTER TABLE public.ai_news
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_ai_news_touch ON public.ai_news;
CREATE TRIGGER trg_ai_news_touch
BEFORE UPDATE ON public.ai_news
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. Add INSERT and DELETE RLS policies for admin
DROP POLICY IF EXISTS "ai_news insert by admin" ON public.ai_news;
CREATE POLICY "ai_news insert by admin"
ON public.ai_news
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "ai_news delete by admin" ON public.ai_news;
CREATE POLICY "ai_news delete by admin"
ON public.ai_news
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Update cleanup_old_news to cap at 7 days
CREATE OR REPLACE FUNCTION public.cleanup_old_news()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_days integer;
  v_val jsonb;
  v_deleted integer;
BEGIN
  SELECT value INTO v_val FROM public.app_settings WHERE key = 'news_retention_days';
  v_days := COALESCE((v_val#>>'{}')::int, 7);
  IF v_days < 1 THEN v_days := 1; END IF;
  IF v_days > 7 THEN v_days := 7; END IF;

  DELETE FROM public.ai_news
  WHERE created_at < now() - (v_days || ' days')::interval;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$function$;

-- 5. Ensure pg_cron + pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;