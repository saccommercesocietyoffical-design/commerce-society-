-- Run once in Supabase SQL Editor, in your existing project.
-- Uses the existing public.is_society_admin() function to restrict writes.
CREATE TABLE IF NOT EXISTS public.society_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_si text,
  category text NOT NULL DEFAULT 'Other',
  image_url text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.society_gallery ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.society_gallery TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.society_gallery TO authenticated;
DROP POLICY IF EXISTS gallery_public_read ON public.society_gallery;
CREATE POLICY gallery_public_read ON public.society_gallery FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS gallery_admin_insert ON public.society_gallery;
CREATE POLICY gallery_admin_insert ON public.society_gallery FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_society_admin()));
DROP POLICY IF EXISTS gallery_admin_update ON public.society_gallery;
CREATE POLICY gallery_admin_update ON public.society_gallery FOR UPDATE TO authenticated USING ((SELECT public.is_society_admin())) WITH CHECK ((SELECT public.is_society_admin()));
DROP POLICY IF EXISTS gallery_admin_delete ON public.society_gallery;
CREATE POLICY gallery_admin_delete ON public.society_gallery FOR DELETE TO authenticated USING ((SELECT public.is_society_admin()));
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('society-gallery','society-gallery',true,5242880,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public=true,file_size_limit=5242880,allowed_mime_types=EXCLUDED.allowed_mime_types;
DROP POLICY IF EXISTS society_gallery_admin_upload ON storage.objects;
CREATE POLICY society_gallery_admin_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='society-gallery' AND (SELECT public.is_society_admin()));
DROP POLICY IF EXISTS society_gallery_admin_delete ON storage.objects;
CREATE POLICY society_gallery_admin_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id='society-gallery' AND (SELECT public.is_society_admin()));
-- Public buckets allow public file downloads; no broad object listing policy needed.
