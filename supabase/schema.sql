create table backlog_items (
  id uuid primary key default gen_random_uuid(),
  linear_id text unique,
  title text not null,
  detail text,
  module text not null, -- bi|orm|creative|perf|legacy|team|integrations|settings|others
  owner text not null,  -- jetin|prem|gayathri|raghav
  priority text not null, -- high|med|low
  status text not null,   -- todo|ip|qa|live|blocked|new
  customers text[] default '{}',
  has_linear boolean default false,
  suggested_due date,
  roadmap_quarter text,   -- e.g. "Q2 2026"
  roadmap_notes text,
  workflow jsonb default '{}', -- {prd:{wiki_path,drive_url,created_at}, figma:{url}, tickets:[{id,title}]}
  manually_overridden boolean default false, -- if true, routine won't overwrite status/module
  last_linear_sync timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on backlog_items(module);
create index on backlog_items(owner);
create index on backlog_items(priority);
create index on backlog_items(status);
create index on backlog_items(roadmap_quarter);

-- auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
create trigger backlog_items_updated_at
  before update on backlog_items
  for each row execute function update_updated_at();
