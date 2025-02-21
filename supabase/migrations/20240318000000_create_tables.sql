-- Create users table
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create goals table
create table if not exists public.goals (
  id text not null primary key,
  user_id uuid references public.users on delete cascade not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create settings table
create table if not exists public.settings (
  user_id uuid references public.users on delete cascade not null primary key,
  settings jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reviews table
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() not null primary key,
  user_id uuid references public.users on delete cascade not null,
  period text not null,
  year integer not null,
  month integer,
  quarter integer,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, period, year, month, quarter)
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.goals enable row level security;
alter table public.settings enable row level security;
alter table public.reviews enable row level security;

-- Create policies
create policy "Users can manage their own data"
  on public.users
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can manage their own goals"
  on public.goals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own settings"
  on public.settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own reviews"
  on public.reviews
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create functions to automatically update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger set_updated_at
  before update
  on public.users
  for each row
  execute function public.set_updated_at();

create trigger set_updated_at
  before update
  on public.goals
  for each row
  execute function public.set_updated_at();

create trigger set_updated_at
  before update
  on public.settings
  for each row
  execute function public.set_updated_at();

create trigger set_updated_at
  before update
  on public.reviews
  for each row
  execute function public.set_updated_at();