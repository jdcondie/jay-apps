-- Users are handled by Supabase Auth automatically

-- Pipelines (saved blueprints)
create table pipelines (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  task_title  text not null,
  task        text not null,
  task_summary text,
  software_stack text,
  client_tag  text default '',
  notes       text default '',
  overall_score int,
  qualify     jsonb,
  exec_map    jsonb,
  blueprint   jsonb,
  pinned_skill_ids uuid[]
);

-- Run logs (per pipeline)
create table run_logs (
  id          uuid primary key default gen_random_uuid(),
  pipeline_id uuid references pipelines(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  logged_at   timestamptz default now(),
  status      text check (status in ('success','partial','failed','running')) not null,
  duration_ms int,
  notes       text
);

-- Skills
create table skills (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  created_at  timestamptz default now(),
  name        text not null,
  trigger_phrase text,
  description text,
  text        text not null
);

-- Saved prompts
create table saved_prompts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  created_at  timestamptz default now(),
  name        text not null,
  description text,
  text        text not null,
  uses        int default 0
);

-- Usage tracking (for billing)
create table usage_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  created_at  timestamptz default now(),
  event_type  text not null,
  input_tokens int default 0,
  output_tokens int default 0
);

-- Subscriptions
create table subscriptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text unique,
  stripe_sub_id     text unique,
  plan              text default 'free',
  status            text default 'active',
  current_period_end timestamptz,
  updated_at        timestamptz default now()
);

-- Row Level Security
alter table pipelines    enable row level security;
alter table run_logs     enable row level security;
alter table skills       enable row level security;
alter table saved_prompts enable row level security;
alter table usage_events enable row level security;
alter table subscriptions enable row level security;

-- RLS Policies
create policy "own pipelines"     on pipelines     for all using (auth.uid() = user_id);
create policy "own run_logs"      on run_logs      for all using (auth.uid() = user_id);
create policy "own skills"        on skills        for all using (auth.uid() = user_id);
create policy "own saved_prompts" on saved_prompts for all using (auth.uid() = user_id);
create policy "own usage_events"  on usage_events  for all using (auth.uid() = user_id);
create policy "own subscriptions" on subscriptions for all using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger pipelines_updated_at before update on pipelines
  for each row execute function update_updated_at();
