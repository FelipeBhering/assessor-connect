-- Assessor-Connect — schema inicial (CRM base)
-- Rodar no Supabase: Dashboard > SQL Editor > New query > colar e Run

create extension if not exists "pgcrypto";

create type risk_profile as enum ('Conservador', 'Moderado', 'Arrojado');
create type client_origin as enum ('Indicacao', 'Evento', 'Redes Sociais', 'Site', 'Parceria');
create type client_status as enum ('active', 'inactive');
create type interaction_type as enum ('call', 'meeting', 'whatsapp', 'email');
create type interaction_source as enum ('manual', 'ai_transcription', 'whatsapp_sync');
create type task_status as enum ('open', 'done', 'cancelled');
create type task_priority as enum ('low', 'medium', 'high');
create type task_origin as enum ('manual', 'ai_generated');
create type product_category as enum ('Renda Fixa', 'Renda Variavel', 'FIIs', 'Internacional');
create type alert_type as enum ('forgotten_client', 'financial_anniversary', 'product_maturity', 'suitability_expiring');
create type alert_status as enum ('open', 'dismissed');

-- Advisor = 1:1 com auth.users (id compartilhado)
create table advisors (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  brokerage text,
  plan text not null default 'trial',
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references advisors (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  city text,
  risk_profile risk_profile not null default 'Moderado',
  origin client_origin,
  status client_status not null default 'active',
  aum numeric(14, 2) not null default 0,
  tags text[] not null default '{}',
  notes text,
  first_contribution_date timestamptz,
  last_contact_at timestamptz,
  suitability_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index clients_advisor_id_idx on clients (advisor_id);

create table client_memories (
  client_id uuid primary key references clients (id) on delete cascade,
  facts jsonb not null default '[]',
  preferences jsonb not null default '{}',
  last_updated_by text not null default 'advisor',
  updated_at timestamptz not null default now()
);

create table interactions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  advisor_id uuid not null references advisors (id) on delete cascade,
  type interaction_type not null,
  source interaction_source not null default 'manual',
  occurred_at timestamptz not null default now(),
  raw_transcript text,
  audio_url text,
  summary text,
  ai_summary text,
  created_at timestamptz not null default now()
);
create index interactions_client_id_idx on interactions (client_id);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  advisor_id uuid not null references advisors (id) on delete cascade,
  interaction_id uuid references interactions (id) on delete set null,
  title text not null,
  description text,
  due_date timestamptz,
  status task_status not null default 'open',
  priority task_priority not null default 'medium',
  origin task_origin not null default 'manual',
  created_at timestamptz not null default now()
);
create index tasks_client_id_idx on tasks (client_id);
create index tasks_advisor_due_idx on tasks (advisor_id, due_date);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category product_category not null,
  issuer text,
  risk_level risk_profile,
  yield_label text,
  min_investment numeric(14, 2)
);

create table portfolio_positions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  product_id uuid not null references products (id) on delete restrict,
  value numeric(14, 2) not null,
  maturity timestamptz,
  contracted_yield text,
  created_at timestamptz not null default now()
);
create index portfolio_positions_client_id_idx on portfolio_positions (client_id);

create table alerts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  advisor_id uuid not null references advisors (id) on delete cascade,
  type alert_type not null,
  status alert_status not null default 'open',
  trigger_date timestamptz not null,
  config jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index alerts_advisor_status_idx on alerts (advisor_id, status);

-- RLS: cada assessor só vê os próprios dados.
-- Hoje as server functions usam a service_role key (bypassa RLS) até existir login real;
-- as policies já ficam prontas para quando trocarmos para o client autenticado por usuário.

alter table advisors enable row level security;
alter table clients enable row level security;
alter table client_memories enable row level security;
alter table interactions enable row level security;
alter table tasks enable row level security;
alter table portfolio_positions enable row level security;
alter table alerts enable row level security;

create policy "advisor reads/edits own row" on advisors
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "advisor owns clients" on clients
  for all using (auth.uid() = advisor_id) with check (auth.uid() = advisor_id);

create policy "advisor owns client memories" on client_memories
  for all using (
    exists (select 1 from clients c where c.id = client_memories.client_id and c.advisor_id = auth.uid())
  ) with check (
    exists (select 1 from clients c where c.id = client_memories.client_id and c.advisor_id = auth.uid())
  );

create policy "advisor owns interactions" on interactions
  for all using (auth.uid() = advisor_id) with check (auth.uid() = advisor_id);

create policy "advisor owns tasks" on tasks
  for all using (auth.uid() = advisor_id) with check (auth.uid() = advisor_id);

create policy "advisor owns portfolio positions" on portfolio_positions
  for all using (
    exists (select 1 from clients c where c.id = portfolio_positions.client_id and c.advisor_id = auth.uid())
  ) with check (
    exists (select 1 from clients c where c.id = portfolio_positions.client_id and c.advisor_id = auth.uid())
  );

create policy "advisor owns alerts" on alerts
  for all using (auth.uid() = advisor_id) with check (auth.uid() = advisor_id);

-- products é catálogo compartilhado, leitura pública para usuários autenticados
alter table products enable row level security;
create policy "authenticated read products" on products
  for select using (auth.role() = 'authenticated');
