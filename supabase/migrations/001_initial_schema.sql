-- ============================================================
-- Vertexia CRM — Initial Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'sales_rep' check (role in ('admin', 'sales_rep')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'sales_rep')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- LEADS
-- ============================================================
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  business_name text not null,
  industry text not null default 'General',
  city text not null default 'Karachi',
  phone text not null,
  whatsapp_number text,
  contact_person text,
  contact_role text not null default 'unknown' check (contact_role in ('owner', 'manager', 'staff', 'unknown')),
  current_website_status text not null default 'none' check (current_website_status in ('none', 'outdated', 'has_website')),
  source text not null default 'cold_call' check (source in ('cold_call', 'referral', 'social', 'other')),
  status text not null default 'new' check (status in ('new', 'contacted', 'follow_up', 'won', 'lost')),
  notes text,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_phone_idx on public.leads(phone);
create index if not exists leads_assigned_to_idx on public.leads(assigned_to);
create index if not exists leads_created_at_idx on public.leads(created_at desc);

alter table public.leads enable row level security;

-- Admin sees all; reps see assigned + unassigned
create policy "Admins can do everything on leads"
  on public.leads for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Reps can view leads assigned to them or unassigned"
  on public.leads for select
  using (
    assigned_to = auth.uid()
    or assigned_to is null
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Reps can insert leads"
  on public.leads for insert
  with check (auth.role() = 'authenticated');

create policy "Reps can update leads assigned to them"
  on public.leads for update
  using (
    assigned_to = auth.uid()
    or assigned_to is null
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_updated_at
  before update on public.leads
  for each row execute procedure public.update_updated_at_column();

-- ============================================================
-- CALL LOGS
-- ============================================================
create table if not exists public.call_logs (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  called_by uuid references public.profiles(id) on delete set null,
  call_outcome text not null check (call_outcome in (
    'no_answer', 'gatekeeper_blocked', 'spoke_to_owner',
    'callback_requested', 'not_interested', 'interested', 'converted'
  )),
  notes text,
  call_number int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists call_logs_lead_id_idx on public.call_logs(lead_id);
create index if not exists call_logs_created_at_idx on public.call_logs(created_at desc);

alter table public.call_logs enable row level security;

create policy "Authenticated users can view call logs"
  on public.call_logs for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert call logs"
  on public.call_logs for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update their own call logs"
  on public.call_logs for update
  using (called_by = auth.uid());

-- Auto-compute call_number (nth call for this lead)
create or replace function public.set_call_number()
returns trigger language plpgsql as $$
declare
  next_number int;
begin
  select coalesce(max(call_number), 0) + 1
    into next_number
    from public.call_logs
   where lead_id = new.lead_id;
  new.call_number = next_number;
  return new;
end;
$$;

create trigger set_call_number_trigger
  before insert on public.call_logs
  for each row execute procedure public.set_call_number();

-- ============================================================
-- SCRIPTS
-- ============================================================
create table if not exists public.scripts (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  script_type text not null check (script_type in ('gatekeeper', 'owner')),
  content text not null,
  business_context_used jsonb,
  model_used text,
  version int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists scripts_lead_id_idx on public.scripts(lead_id);
create index if not exists scripts_lead_type_idx on public.scripts(lead_id, script_type);

alter table public.scripts enable row level security;

create policy "Authenticated users can view scripts"
  on public.scripts for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert scripts"
  on public.scripts for insert
  with check (auth.role() = 'authenticated');

-- ============================================================
-- CLIENTS
-- ============================================================
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.leads(id) on delete set null,
  business_name text not null,
  contact_person text,
  phone text not null,
  whatsapp_number text,
  plan text,
  contract_start_date date,
  website_status text,
  payment_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_lead_id_idx on public.clients(lead_id);

alter table public.clients enable row level security;

create policy "Authenticated users can view clients"
  on public.clients for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert clients"
  on public.clients for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update clients"
  on public.clients for update
  using (auth.role() = 'authenticated');

create trigger clients_updated_at
  before update on public.clients
  for each row execute procedure public.update_updated_at_column();

-- ============================================================
-- HELPER VIEW: leads with call counts
-- ============================================================
create or replace view public.leads_with_call_info as
select
  l.*,
  coalesce(cl.call_count, 0) as call_count,
  cl.last_call_at,
  cl.last_call_outcome
from public.leads l
left join (
  select
    lead_id,
    count(*) as call_count,
    max(created_at) as last_call_at,
    (array_agg(call_outcome order by created_at desc))[1] as last_call_outcome
  from public.call_logs
  group by lead_id
) cl on cl.lead_id = l.id;
