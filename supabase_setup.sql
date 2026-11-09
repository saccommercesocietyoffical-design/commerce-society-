-- Run in Supabase Dashboard > SQL Editor.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('society-photos','society-photos',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
create table if not exists public.society_profile_photos (
 role text primary key check (role in ('teacher','president','secretary','treasurer')),
 storage_path text not null, public_url text not null, updated_at timestamptz not null default now()
);
alter table public.society_profile_photos enable row level security;
drop policy if exists "Public can view team photo records" on public.society_profile_photos;
create policy "Public can view team photo records" on public.society_profile_photos for select using (true);
drop policy if exists "Authenticated admins manage team photo records" on public.society_profile_photos;
create policy "Authenticated admins manage team photo records" on public.society_profile_photos for all to authenticated using (true) with check (true);
drop policy if exists "Public can view society photos" on storage.objects;
create policy "Public can view society photos" on storage.objects for select using (bucket_id='society-photos');
drop policy if exists "Authenticated admins upload society photos" on storage.objects;
create policy "Authenticated admins upload society photos" on storage.objects for insert to authenticated with check (bucket_id='society-photos');
drop policy if exists "Authenticated admins update society photos" on storage.objects;
create policy "Authenticated admins update society photos" on storage.objects for update to authenticated using (bucket_id='society-photos') with check (bucket_id='society-photos');
drop policy if exists "Authenticated admins delete society photos" on storage.objects;
create policy "Authenticated admins delete society photos" on storage.objects for delete to authenticated using (bucket_id='society-photos');
