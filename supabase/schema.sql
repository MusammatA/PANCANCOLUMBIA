-- Columbia University for PanCAN: admin editing backend.
-- Run this whole file once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- It is safe to re-run; it will not duplicate the starting data.

-- ---------------------------------------------------------------------------
-- Who may log in: board emails only.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key check (email = lower(email)),
  name text not null default '',
  added_at timestamptz not null default now()
);

-- True when an email is on the board list. Callable before login so the site
-- can refuse to send codes to anyone else.
create or replace function public.is_board_email(check_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where email = lower(trim(check_email)));
$$;

-- True when the signed-in user is on the board list.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_board_email(text) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Auth hook: refuses to create an account for any email that is not on the
-- board list, even if someone calls Supabase directly. Turn it on in
-- Dashboard -> Authentication -> Hooks -> "Before User Created" -> Postgres
-- function -> public.board_only_signup.
create or replace function public.board_only_signup(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_board_email(event -> 'user' ->> 'email') then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object(
    'error', jsonb_build_object('http_code', 403, 'message', 'Only board members can sign in.')
  );
end;
$$;

grant execute on function public.board_only_signup(jsonb) to supabase_auth_admin;
revoke execute on function public.board_only_signup(jsonb) from authenticated, anon, public;

alter table public.admins enable row level security;

drop policy if exists "admins can read admins" on public.admins;
create policy "admins can read admins" on public.admins
  for select to authenticated using (public.is_admin());

drop policy if exists "admins can add admins" on public.admins;
create policy "admins can add admins" on public.admins
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admins can update admins" on public.admins;
create policy "admins can update admins" on public.admins
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins can remove other admins" on public.admins;
create policy "admins can remove other admins" on public.admins
  for delete to authenticated
  using (public.is_admin() and email <> lower(coalesce(auth.jwt() ->> 'email', '')));

-- ---------------------------------------------------------------------------
-- Edited website text. Each row overrides one piece of text on the site;
-- deleting a row puts the original wording back.
-- ---------------------------------------------------------------------------
create table if not exists public.site_text (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  event_date text not null default '',
  location text not null default '',
  photo_url text not null default '',
  is_upcoming boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Extra text boxes admins add to any page.
-- ---------------------------------------------------------------------------
create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  page text not null check (page in ('home', 'events', 'join', 'contact')),
  title text not null default '',
  body text not null default '',
  design text not null default 'card' check (design in ('card', 'purple', 'lavender', 'quote')),
  image_url text not null default '',
  button_label text not null default '',
  button_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Everyone can read site content; only admins can change it.
do $$
declare t text;
begin
  foreach t in array array['site_text', 'events', 'blocks'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public can read" on public.%I', t);
    execute format('create policy "public can read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "admins can insert" on public.%I', t);
    execute format('create policy "admins can insert" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('drop policy if exists "admins can update" on public.%I', t);
    execute format('create policy "admins can update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('drop policy if exists "admins can delete" on public.%I', t);
    execute format('create policy "admins can delete" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Photo uploads (public to view, admins only to upload). 5 MB limit.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists "admins can upload site images" on storage.objects;
create policy "admins can upload site images" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-images' and public.is_admin());

drop policy if exists "admins can change site images" on storage.objects;
create policy "admins can change site images" on storage.objects
  for update to authenticated using (bucket_id = 'site-images' and public.is_admin());

drop policy if exists "admins can delete site images" on storage.objects;
create policy "admins can delete site images" on storage.objects
  for delete to authenticated using (bucket_id = 'site-images' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Starting data
-- ---------------------------------------------------------------------------
insert into public.admins (email, name) values
  ('columbia4pancan@gmail.com', 'Columbia 4 PanCAN'),
  ('kk3875@columbia.edu', 'Khadicha'),
  ('mjg2312@columbia.edu', 'Magaly'),
  ('jm6139@columbia.edu', 'Jailyn'),
  ('ns4028@columbia.edu', 'Nimra'),
  ('cm4680@columbia.edu', 'Celina'),
  ('mea2222@columbia.edu', 'Musammat')
on conflict (email) do nothing;

insert into public.events (name, description, event_date, location, photo_url, is_upcoming, sort_order)
select * from (values
  ('First Tabling Event',
   'Introducing Columbia 4 PanCAN through its first tabling event to a Columbia student audience. Come by Lerner Ramps for some yummy Purple PanCAN Ube cookies and to learn more about pancreatic cancer research.',
   'Friday, November 13, 2026', 'Lerner Ramps', '/images/events/awareness-tabling.webp', true, 0),
  ('Expert Networking Panels', 'Meet pancreatic cancer professionals in research and medicine.', '', '', '/images/events/professional-panels.webp', false, 1),
  ('Patient & Family Panels', 'Hear from pancreatic cancer patients and their families.', '', '', '/images/events/patient-family-panels.webp', false, 2),
  ('Monthly Meetings', 'Bringing together campus life each month.', '', '', '/images/events/chapter-meetings.webp', false, 3),
  ('Awareness Tabling', 'Tabling on campus to raise awareness.', '', '', '/images/events/awareness-tabling.webp', false, 4),
  ('Fundraisers', 'Fun fundraisers throughout the year.', '', '', '/images/events/fundraisers.webp', false, 5)
) as seed(name, description, event_date, location, photo_url, is_upcoming, sort_order)
where not exists (select 1 from public.events);
