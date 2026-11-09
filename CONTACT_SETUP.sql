-- Run once in Supabase SQL Editor. Existing public.is_society_admin() must exist.
-- Anonymous visitors may submit, but cannot read, edit or delete messages.
CREATE TABLE IF NOT EXISTS public.society_contact_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 sender_name text NOT NULL CHECK (char_length(trim(sender_name)) BETWEEN 1 AND 100),
 sender_email text NOT NULL CHECK (char_length(sender_email) BETWEEN 3 AND 254),
 message text NOT NULL CHECK (char_length(trim(message)) BETWEEN 1 AND 3000),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.society_contact_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.society_contact_messages FROM anon,authenticated;
GRANT INSERT ON public.society_contact_messages TO anon,authenticated;
GRANT SELECT,DELETE ON public.society_contact_messages TO authenticated;
DROP POLICY IF EXISTS contact_public_insert ON public.society_contact_messages;
CREATE POLICY contact_public_insert ON public.society_contact_messages FOR INSERT TO anon,authenticated WITH CHECK (true);
DROP POLICY IF EXISTS contact_admin_read ON public.society_contact_messages;
CREATE POLICY contact_admin_read ON public.society_contact_messages FOR SELECT TO authenticated USING ((SELECT public.is_society_admin()));
DROP POLICY IF EXISTS contact_admin_delete ON public.society_contact_messages;
CREATE POLICY contact_admin_delete ON public.society_contact_messages FOR DELETE TO authenticated USING ((SELECT public.is_society_admin()));
-- For public forms, consider CAPTCHA/rate limiting before heavy traffic.
