create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  user_type text not null check (user_type in ('STUDENT', 'TEACHER', 'STAFF', 'DRIVER', 'TRANSPORT_ADMIN')),
  full_name text not null check (char_length(full_name) between 2 and 120),
  department_code text check (department_code in ('01','02','03','04','05','06','07','08','09','10','11','12')),
  department_name text,
  institutional_id text,
  student_id text,
  phone text,
  email text not null,
  gender text not null default 'PREFER_NOT_TO_SAY'
    check (gender in ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
  profile_image text,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  approval_status text not null default 'APPROVED'
    check (approval_status in ('PENDING', 'APPROVED', 'REJECTED')),
  registration_status text not null default 'PENDING_VERIFICATION'
    check (registration_status in ('PENDING_VERIFICATION', 'PENDING_APPROVAL', 'VERIFIED', 'APPROVED', 'REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_student_identity check (
    (user_type = 'STUDENT' and student_id is not null)
    or (user_type <> 'STUDENT' and student_id is null)
  ),
  constraint profiles_driver_approval check (
    (user_type = 'DRIVER') or approval_status = 'APPROVED'
  )
);

create unique index if not exists profiles_email_unique on public.profiles (lower(email));
-- The three-digit student ID repeats across cohorts and departments; only the
-- full institutional ID is globally unique.
drop index if exists public.profiles_student_id_unique;
create index if not exists profiles_student_id_idx on public.profiles (student_id) where student_id is not null;
create unique index if not exists profiles_institutional_id_unique on public.profiles (institutional_id) where institutional_id is not null;
create index if not exists profiles_user_type_idx on public.profiles (user_type);
create index if not exists profiles_driver_approval_idx on public.profiles (approval_status) where user_type = 'DRIVER';

create table if not exists public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_hash text not null,
  purpose text not null default 'REGISTRATION'
    check (purpose in ('REGISTRATION', 'PASSWORD_RESET', 'EMAIL_CHANGE')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  expires_at timestamptz not null,
  verified_at timestamptz,
  invalidated_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_verifications_lookup_idx
  on public.email_verifications (lower(email), purpose, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.email_verifications enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = auth_user_id);

revoke all on table public.profiles from anon;
revoke all on table public.email_verifications from anon, authenticated;
grant select on table public.profiles to authenticated;

comment on table public.email_verifications is
  'Server-only OTP hashes. The service-role backend is the sole application accessor.';

notify pgrst, 'reload schema';
