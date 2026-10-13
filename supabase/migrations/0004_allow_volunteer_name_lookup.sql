-- Allow registration staff to choose from active volunteer display names.

create policy "Authenticated users can read active volunteer names"
on public.profiles for select
to authenticated
using (is_active and role = 'VOLUNTEER');