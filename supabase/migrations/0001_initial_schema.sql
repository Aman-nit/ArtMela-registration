-- Art Mela registration schema.
-- Supabase Auth owns authentication credentials in auth.users.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete restrict,
  username text not null unique,
  role text not null check (role in ('ADMIN', 'VOLUNTEER')),
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  serial_number bigint generated always as identity unique not null,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  contact_number text not null check (char_length(btrim(contact_number)) between 7 and 20),
  age smallint not null check (age between 3 and 100),
  gender text not null check (char_length(btrim(gender)) between 1 and 30),
  photo_path text not null check (char_length(btrim(photo_path)) > 0),
  registered_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index participants_created_at_idx on public.participants (created_at desc);
create index participants_name_idx on public.participants (lower(name));
create index participants_contact_number_idx on public.participants (contact_number);
create index participants_registered_by_idx on public.participants (registered_by);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger participants_set_updated_at
before update on public.participants
for each row execute function public.set_updated_at();

create or replace function public.has_active_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = required_role
      and is_active
  );
$$;

revoke execute on function public.has_active_role(text) from public;
grant execute on function public.has_active_role(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.participants enable row level security;

create policy "Authenticated users can read their own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "Admins can read all profiles"
on public.profiles for select
to authenticated
using (public.has_active_role('ADMIN'));

create policy "Active volunteers can create participants"
on public.participants for insert
to authenticated
with check (
  registered_by = (select auth.uid())
  and (public.has_active_role('ADMIN') or public.has_active_role('VOLUNTEER'))
);

create policy "Active volunteers can read their own participants"
on public.participants for select
to authenticated
using (
  registered_by = (select auth.uid())
  and public.has_active_role('VOLUNTEER')
);

create policy "Active admins can read all participants"
on public.participants for select
to authenticated
using (public.has_active_role('ADMIN'));

revoke all on public.profiles from anon;
revoke all on public.participants from anon;
