/*
  # Initial Schema Setup for Construction QC System

  1. Tables
    - documents
    - inspections
    - deficiencies
    - photos
    - notifications
    - comments
    - activities

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated users
*/

-- Enable pgvector extension for photo analysis features
create extension if not exists vector;

-- Documents table
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('spec', 'code', 'requirement')),
  content text not null,
  version integer not null default 1,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  revision_history jsonb[] not null default array[]::jsonb[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- Inspections table
create table if not exists inspections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date timestamptz not null,
  location text not null,
  status text not null default 'pending' check (status in ('pending', 'in-progress', 'completed', 'failed', 'cancelled')),
  assigned_to uuid references auth.users(id),
  checklist jsonb not null default '[]'::jsonb,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  job_number text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- Deficiencies table
create table if not exists deficiencies (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'high')),
  location text not null,
  status text not null default 'open' check (status in ('open', 'in-progress', 'resolved')),
  inspection_id uuid references inspections(id),
  assigned_to uuid references auth.users(id),
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- Photos table
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  description text,
  location text not null,
  deficiency_id uuid references deficiencies(id),
  inspection_id uuid references inspections(id),
  job_number text not null,
  metadata jsonb not null default '{}'::jsonb,
  analysis jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- Notifications table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null check (type in ('deficiency', 'inspection', 'task', 'system')),
  severity text not null check (severity in ('info', 'warning', 'critical')),
  read boolean not null default false,
  related_id uuid,
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id)
);

-- Comments table
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  entity_type text not null check (entity_type in ('inspection', 'deficiency', 'document')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- Activities table
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  entity_type text not null,
  entity_id uuid not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- Enable RLS
alter table documents enable row level security;
alter table inspections enable row level security;
alter table deficiencies enable row level security;
alter table photos enable row level security;
alter table notifications enable row level security;
alter table comments enable row level security;
alter table activities enable row level security;

-- RLS Policies
create policy "Users can read all documents"
  on documents for select
  to authenticated
  using (true);

create policy "Users can read all inspections"
  on inspections for select
  to authenticated
  using (true);

create policy "Users can read all deficiencies"
  on deficiencies for select
  to authenticated
  using (true);

create policy "Users can read all photos"
  on photos for select
  to authenticated
  using (true);

create policy "Users can read own notifications"
  on notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read all comments"
  on comments for select
  to authenticated
  using (true);

create policy "Users can read all activities"
  on activities for select
  to authenticated
  using (true);

-- Insert policies for authenticated users
create policy "Users can insert documents"
  on documents for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Users can insert inspections"
  on inspections for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Users can insert deficiencies"
  on deficiencies for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Users can insert photos"
  on photos for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Users can insert comments"
  on comments for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Update policies
create policy "Users can update own documents"
  on documents for update
  to authenticated
  using (auth.uid() = created_by);

create policy "Users can update assigned inspections"
  on inspections for update
  to authenticated
  using (auth.uid() = assigned_to or auth.uid() = created_by);

create policy "Users can update assigned deficiencies"
  on deficiencies for update
  to authenticated
  using (auth.uid() = assigned_to or auth.uid() = created_by);