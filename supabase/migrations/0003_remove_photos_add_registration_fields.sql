-- Registration no longer collects or stores participant photos.
-- New fields stay nullable for compatibility with existing registrations.

alter table public.participants
  add column address text,
  add column guardian_name text,
  add column volunteer_name text;

alter table public.participants
  drop column photo_path;

drop policy if exists "Authenticated users can upload participant photos" on storage.objects;
drop policy if exists "Admins can view participant photos" on storage.objects;

alter table public.participants
  add constraint participants_address_length check (address is null or char_length(btrim(address)) between 1 and 500),
  add constraint participants_guardian_name_length check (guardian_name is null or char_length(btrim(guardian_name)) between 1 and 200),
  add constraint participants_volunteer_name_length check (volunteer_name is null or char_length(btrim(volunteer_name)) between 1 and 200);