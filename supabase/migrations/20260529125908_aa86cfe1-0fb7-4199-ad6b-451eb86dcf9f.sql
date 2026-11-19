CREATE OR REPLACE FUNCTION public.cleanup_old_news()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days integer;
  v_val jsonb;
  v_deleted integer;
BEGIN
  SELECT value INTO v_val FROM public.app_settings WHERE key = 'news_retention_days';
  v_days := COALESCE((v_val#>>'{}')::int, 30);
  IF v_days < 1 THEN v_days := 1; END IF;
  IF v_days > 365 THEN v_days := 365; END IF;

  DELETE FROM public.ai_news
  WHERE created_at < now() - (v_days || ' days')::interval;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;