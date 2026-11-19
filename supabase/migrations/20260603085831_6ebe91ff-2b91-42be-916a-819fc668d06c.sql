REVOKE EXECUTE ON FUNCTION public.cleanup_old_news() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_news() FROM anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_news() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_news() TO service_role;