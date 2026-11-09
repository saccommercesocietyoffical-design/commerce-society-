-- Run once in Supabase SQL Editor before using Event Management.
ALTER TABLE public.society_events ADD COLUMN IF NOT EXISTS title_si text;
ALTER TABLE public.society_events ADD COLUMN IF NOT EXISTS description_si text;
