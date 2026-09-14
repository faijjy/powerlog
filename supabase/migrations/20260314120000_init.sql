-- PowerLog schema: companies, profiles, libraries, sites, materials, reports
-- Enable extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum ('admin', 'electrician');
create type public.site_status as enum ('in_progress', 'completed');

-- Companies
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  display_name text,
  created_at timestamptz not null default now()
);

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  role public.user_role,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Item library (company-scoped)
create table public.item_library (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  category text not null,
  name text not null,
  default_unit text not null default 'Pc',
  brand text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index item_library_company_idx on public.item_library (company_id);
create index item_library_name_idx on public.item_library (company_id, name);

-- Work library
create table public.work_library (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  default_unit text not null default 'Job',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index work_library_company_idx on public.work_library (company_id);

-- Sites
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  customer_name text not null,
  customer_phone text,
  site_name text not null,
  site_address text,
  site_date date not null default current_date,
  notes text,
  status public.site_status not null default 'in_progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sites_company_idx on public.sites (company_id);
create index sites_created_by_idx on public.sites (created_by);
create index sites_date_idx on public.sites (site_date);

-- Site materials
create table public.site_materials (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  library_item_id uuid references public.item_library (id) on delete set null,
  name text not null,
  category text,
  brand text,
  unit text not null default 'Pc',
  qty_required numeric not null default 0 check (qty_required >= 0),
  qty_used numeric not null default 0 check (qty_used >= 0),
  unit_price numeric,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index site_materials_site_idx on public.site_materials (site_id);

-- Daily reports
create table public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  report_date date not null default current_date,
  notes text,
  pending_work text,
  created_at timestamptz not null default now()
);

create index daily_reports_site_idx on public.daily_reports (site_id);
create index daily_reports_company_idx on public.daily_reports (company_id);

-- Daily report work items
create table public.daily_report_work (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.daily_reports (id) on delete cascade,
  work_library_id uuid references public.work_library (id) on delete set null,
  name text not null,
  quantity numeric not null default 1 check (quantity >= 0),
  unit text not null default 'Job'
);

-- Daily report photos
create table public.daily_report_photos (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.daily_reports (id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- Helper: current user's profile company
create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_company_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and company_id is not null
  );
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create company + seed libraries (admin)
create or replace function public.create_company(p_name text, p_display_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.profiles where id = auth.uid() and company_id is not null) then
    raise exception 'Already in a company';
  end if;

  v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.companies (name, invite_code, display_name)
  values (p_name, v_code, coalesce(p_display_name, p_name))
  returning id into v_company_id;

  update public.profiles
  set company_id = v_company_id, role = 'admin', updated_at = now()
  where id = auth.uid();

  -- Seed default work types
  insert into public.work_library (company_id, name, default_unit, created_by)
  values
    (v_company_id, 'Boards Installed', 'Pc', auth.uid()),
    (v_company_id, 'MCBs Installed', 'Pc', auth.uid()),
    (v_company_id, 'Switches Installed', 'Pc', auth.uid()),
    (v_company_id, 'Sockets Installed', 'Pc', auth.uid()),
    (v_company_id, 'Fans Installed', 'Pc', auth.uid()),
    (v_company_id, 'Lights Installed', 'Pc', auth.uid()),
    (v_company_id, 'Wiring Completed', 'Job', auth.uid()),
    (v_company_id, 'DB Box Wiring', 'Job', auth.uid());

  -- Seed default electrical items
  insert into public.item_library (company_id, category, name, default_unit, brand, created_by)
  values
    (v_company_id, 'MCB & Distribution', 'MCB Box', 'Pc', null, auth.uid()),
    (v_company_id, 'MCB & Distribution', '6A MCB', 'Pc', null, auth.uid()),
    (v_company_id, 'MCB & Distribution', '16A MCB', 'Pc', null, auth.uid()),
    (v_company_id, 'MCB & Distribution', '32A MCB', 'Pc', null, auth.uid()),
    (v_company_id, 'MCB & Distribution', 'DB Box', 'Pc', null, auth.uid()),
    (v_company_id, 'Switches', '6A Switch', 'Pc', null, auth.uid()),
    (v_company_id, 'Switches', '16A Switch', 'Pc', null, auth.uid()),
    (v_company_id, 'Switches', 'Two-Way Switch', 'Pc', null, auth.uid()),
    (v_company_id, 'Sockets', '6A Socket', 'Pc', null, auth.uid()),
    (v_company_id, 'Sockets', '16A Socket', 'Pc', null, auth.uid()),
    (v_company_id, 'Sockets', '5-in-1 Socket', 'Pc', null, auth.uid()),
    (v_company_id, 'Modular Boards', '8 Module Board', 'Pc', null, auth.uid()),
    (v_company_id, 'Modular Boards', '12 Module Board', 'Pc', null, auth.uid()),
    (v_company_id, 'Modular Boards', '18 Module Board', 'Pc', null, auth.uid()),
    (v_company_id, 'Wires & Cables', '1.5mm Wire', 'Meter', 'Polycab', auth.uid()),
    (v_company_id, 'Wires & Cables', '2.5mm Wire', 'Meter', 'Polycab', auth.uid()),
    (v_company_id, 'Wires & Cables', '4mm Wire', 'Meter', 'Polycab', auth.uid()),
    (v_company_id, 'Wires & Cables', '6mm Wire', 'Meter', null, auth.uid()),
    (v_company_id, 'Lights', 'LED Bulb 9W', 'Pc', null, auth.uid()),
    (v_company_id, 'Lights', 'LED Panel Light', 'Pc', null, auth.uid()),
    (v_company_id, 'Lights', 'Tube Light', 'Pc', null, auth.uid()),
    (v_company_id, 'Fans', 'Ceiling Fan', 'Pc', null, auth.uid()),
    (v_company_id, 'Fans', 'Exhaust Fan', 'Pc', null, auth.uid()),
    (v_company_id, 'Fans', 'Fan Regulator', 'Pc', null, auth.uid()),
    (v_company_id, 'Conduits & Pipes', '20mm PVC Conduit', 'Meter', null, auth.uid()),
    (v_company_id, 'Conduits & Pipes', '25mm PVC Conduit', 'Meter', null, auth.uid()),
    (v_company_id, 'Conduits & Pipes', '20mm Flexible Conduit', 'Meter', null, auth.uid()),
    (v_company_id, 'Junction Boxes', 'Junction Box', 'Pc', null, auth.uid()),
    (v_company_id, 'Junction Boxes', 'Deep Junction Box', 'Pc', null, auth.uid()),
    (v_company_id, 'Electrical Accessories', 'Tape Roll', 'Pc', null, auth.uid()),
    (v_company_id, 'Electrical Accessories', 'Cable Tie Pack', 'Pc', null, auth.uid()),
    (v_company_id, 'Electrical Accessories', 'Gang Box', 'Pc', null, auth.uid()),
    (v_company_id, 'Tools', 'Screw Pack', 'Pc', null, auth.uid()),
    (v_company_id, 'Other', 'Miscellaneous', 'Pc', null, auth.uid());

  return v_company_id;
end;
$$;

-- Join company with invite code (electrician)
create or replace function public.join_company(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.profiles where id = auth.uid() and company_id is not null) then
    raise exception 'Already in a company';
  end if;

  select id into v_company_id
  from public.companies
  where upper(invite_code) = upper(trim(p_invite_code));

  if v_company_id is null then
    raise exception 'Invalid invite code';
  end if;

  update public.profiles
  set company_id = v_company_id, role = 'electrician', updated_at = now()
  where id = auth.uid();

  return v_company_id;
end;
$$;

grant execute on function public.create_company(text, text) to authenticated;
grant execute on function public.join_company(text) to authenticated;

-- RLS
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.item_library enable row level security;
alter table public.work_library enable row level security;
alter table public.sites enable row level security;
alter table public.site_materials enable row level security;
alter table public.daily_reports enable row level security;
alter table public.daily_report_work enable row level security;
alter table public.daily_report_photos enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can view company colleagues"
  on public.profiles for select
  using (company_id is not null and company_id = public.current_company_id());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Companies
create policy "Members can view own company"
  on public.companies for select
  using (id = public.current_company_id());

create policy "Admins can update company"
  on public.companies for update
  using (id = public.current_company_id() and public.is_company_admin());

-- Item library
create policy "Company members can view items"
  on public.item_library for select
  using (company_id = public.current_company_id());

create policy "Company members can insert items"
  on public.item_library for insert
  with check (company_id = public.current_company_id());

create policy "Company members can update items"
  on public.item_library for update
  using (company_id = public.current_company_id());

create policy "Company members can delete items"
  on public.item_library for delete
  using (company_id = public.current_company_id());

-- Work library
create policy "Company members can view work"
  on public.work_library for select
  using (company_id = public.current_company_id());

create policy "Company members can insert work"
  on public.work_library for insert
  with check (company_id = public.current_company_id());

create policy "Company members can update work"
  on public.work_library for update
  using (company_id = public.current_company_id());

create policy "Company members can delete work"
  on public.work_library for delete
  using (company_id = public.current_company_id());

-- Sites
create policy "Company members can view sites"
  on public.sites for select
  using (company_id = public.current_company_id());

create policy "Company members can insert sites"
  on public.sites for insert
  with check (
    company_id = public.current_company_id()
    and created_by = auth.uid()
  );

create policy "Creators and admins can update sites"
  on public.sites for update
  using (
    company_id = public.current_company_id()
    and (created_by = auth.uid() or public.is_company_admin())
  );

create policy "Creators and admins can delete sites"
  on public.sites for delete
  using (
    company_id = public.current_company_id()
    and (created_by = auth.uid() or public.is_company_admin())
  );

-- Site materials
create policy "Company members can view materials"
  on public.site_materials for select
  using (company_id = public.current_company_id());

create policy "Company members can insert materials"
  on public.site_materials for insert
  with check (company_id = public.current_company_id());

create policy "Company members can update materials"
  on public.site_materials for update
  using (company_id = public.current_company_id());

create policy "Company members can delete materials"
  on public.site_materials for delete
  using (company_id = public.current_company_id());

-- Daily reports
create policy "Company members can view reports"
  on public.daily_reports for select
  using (company_id = public.current_company_id());

create policy "Company members can insert reports"
  on public.daily_reports for insert
  with check (
    company_id = public.current_company_id()
    and created_by = auth.uid()
  );

create policy "Creators and admins can update reports"
  on public.daily_reports for update
  using (
    company_id = public.current_company_id()
    and (created_by = auth.uid() or public.is_company_admin())
  );

create policy "Creators and admins can delete reports"
  on public.daily_reports for delete
  using (
    company_id = public.current_company_id()
    and (created_by = auth.uid() or public.is_company_admin())
  );

-- Report work (via report company)
create policy "Company members can view report work"
  on public.daily_report_work for select
  using (
    exists (
      select 1 from public.daily_reports r
      where r.id = report_id and r.company_id = public.current_company_id()
    )
  );

create policy "Company members can insert report work"
  on public.daily_report_work for insert
  with check (
    exists (
      select 1 from public.daily_reports r
      where r.id = report_id and r.company_id = public.current_company_id()
    )
  );

create policy "Company members can update report work"
  on public.daily_report_work for update
  using (
    exists (
      select 1 from public.daily_reports r
      where r.id = report_id and r.company_id = public.current_company_id()
    )
  );

create policy "Company members can delete report work"
  on public.daily_report_work for delete
  using (
    exists (
      select 1 from public.daily_reports r
      where r.id = report_id and r.company_id = public.current_company_id()
    )
  );

-- Report photos
create policy "Company members can view report photos"
  on public.daily_report_photos for select
  using (
    exists (
      select 1 from public.daily_reports r
      where r.id = report_id and r.company_id = public.current_company_id()
    )
  );

create policy "Company members can insert report photos"
  on public.daily_report_photos for insert
  with check (
    exists (
      select 1 from public.daily_reports r
      where r.id = report_id and r.company_id = public.current_company_id()
    )
  );

create policy "Company members can delete report photos"
  on public.daily_report_photos for delete
  using (
    exists (
      select 1 from public.daily_reports r
      where r.id = report_id and r.company_id = public.current_company_id()
    )
  );

-- Storage bucket for report photos
insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload report photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'report-photos');

create policy "Anyone can view report photos"
  on storage.objects for select
  using (bucket_id = 'report-photos');

create policy "Authenticated users can delete own report photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'report-photos');
