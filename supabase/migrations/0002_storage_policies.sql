-- Private participant photo access.

insert into storage.buckets (id, name, public)
values ('participant-photos', 'participant-photos', false)
on conflict (id) do update set public = excluded.public;

create policy "Authenticated users can upload participant photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'participant-photos'
  and (public.has_active_role('ADMIN') or public.has_active_role('VOLUNTEER'))
);

create policy "Admins can view participant photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'participant-photos'
  and public.has_active_role('ADMIN')
);
