
-- Restrict listing of media bucket (public URL reads still work for public buckets)
DROP POLICY IF EXISTS "media public read" ON storage.objects;
CREATE POLICY "media admin list"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'media' AND has_role(auth.uid(), 'admin'::app_role));

-- Tighten quiz_results insert: enforce reasonable bounds instead of always-true
DROP POLICY IF EXISTS "results insertable by all" ON public.quiz_results;
CREATE POLICY "results insertable by all"
ON public.quiz_results FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(nickname) BETWEEN 1 AND 50
  AND score >= 0
  AND total > 0
  AND score <= total
);
