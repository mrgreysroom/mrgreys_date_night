-- MR GREY'S WORLD — Update 09
-- Run once in Supabase SQL editor before testing Stripe webhooks.
create table if not exists public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  stripe_subscription_id text unique not null,
  stripe_customer_id text,
  email text,
  display_name text,
  date_of_birth date,
  marketing_consent boolean not null default false,
  tier text not null default 'founding',
  status text not null default 'inactive',
  is_active boolean not null default false,
  cancel_at_period_end boolean not null default false,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_likes (
  id uuid primary key default gen_random_uuid(),
  member_ref text not null,
  story_slug text not null,
  created_at timestamptz not null default now(),
  unique(member_ref, story_slug)
);

alter table public.club_memberships enable row level security;
alter table public.story_likes enable row level security;
-- Server routes use SUPABASE_SERVICE_ROLE_KEY. No public policies are required.

-- Update 10: internal team access. Owner/admin bypass Stripe and have 100% content access.
create table if not exists public.team_access (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null check (role in ('owner','admin','moderator','employee','member')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.team_access enable row level security;

insert into public.team_access(email,role,is_active) values
  ('tomas27matta@gmail.com','owner',true),
  ('timeamrazikova@gmail.com','admin',true)
on conflict(email) do update set role=excluded.role,is_active=true,updated_at=now();

-- Update 12: account, notifications, Story follows, product entitlements, DESIRE history + Journey.
create table if not exists public.member_profiles (
  email text primary key,
  display_name text,
  date_of_birth date,
  preferred_language text not null default 'sk' check (preferred_language in ('sk','cs','pl','en')),
  marketing_consent boolean not null default false,
  notify_email boolean not null default true,
  notify_club boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.member_notifications (
  id uuid primary key default gen_random_uuid(),
  member_email text not null,
  kind text not null default 'general',
  title text not null,
  body text,
  href text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists member_notifications_email_created_idx on public.member_notifications(member_email,created_at desc);
create index if not exists member_notifications_unread_idx on public.member_notifications(member_email,is_read);

create table if not exists public.story_subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_email text not null,
  story_slug text not null,
  email_enabled boolean not null default true,
  club_enabled boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(member_email,story_slug)
);

create table if not exists public.product_entitlements (
  id uuid primary key default gen_random_uuid(),
  member_email text not null,
  product_key text not null,
  source text not null default 'stripe',
  stripe_session_id text,
  stripe_payment_intent text,
  is_active boolean not null default true,
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(member_email,product_key)
);
create index if not exists product_entitlements_email_idx on public.product_entitlements(member_email,product_key,is_active);

create table if not exists public.desire_deep_sessions (
  id uuid primary key default gen_random_uuid(),
  test_slug text not null,
  owner_email text not null,
  partner_email text,
  invite_token text unique not null,
  status text not null default 'A_IN_PROGRESS',
  a_answers jsonb,
  b_answers jsonb,
  result_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists desire_deep_owner_idx on public.desire_deep_sessions(owner_email,created_at desc);
create index if not exists desire_deep_partner_idx on public.desire_deep_sessions(partner_email,created_at desc);

create table if not exists public.desire_result_history (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  test_slug text not null,
  member_email text not null,
  partner_email text,
  result_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique(session_id,member_email)
);
create index if not exists desire_result_member_idx on public.desire_result_history(member_email,created_at desc);

create table if not exists public.desire_journeys (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null,
  partner_email text,
  sequence jsonb not null,
  current_step integer not null default 0,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  next_unlock_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists desire_journey_owner_idx on public.desire_journeys(owner_email,status,created_at desc);

alter table public.member_profiles enable row level security;
alter table public.member_notifications enable row level security;
alter table public.story_subscriptions enable row level security;
alter table public.product_entitlements enable row level security;
alter table public.desire_deep_sessions enable row level security;
alter table public.desire_result_history enable row level security;
alter table public.desire_journeys enable row level security;
-- Server routes use SUPABASE_SECRET_KEY/service role. No public policies are required.

-- UPDATE 12 scaling indexes
create index if not exists desire_journey_unlock_idx on public.desire_journeys(status,next_unlock_at) where status='active';
create index if not exists story_subscriptions_member_idx on public.story_subscriptions(member_email,is_active);
create index if not exists member_profiles_language_idx on public.member_profiles(preferred_language);
