-- Upgrade databases that ran the original SAFAR profile migration.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'user_type'
  ) then
    alter table public.profiles rename column role to user_type;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'department'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'department_name'
  ) then
    alter table public.profiles rename column department to department_name;
  end if;
end $$;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles drop constraint if exists profiles_user_type_check;
alter table public.profiles drop constraint if exists profiles_department_code_check;
alter table public.profiles drop constraint if exists profiles_approval_status_check;
alter table public.profiles drop constraint if exists profiles_registration_status_check;
alter table public.profiles drop constraint if exists profiles_student_identity;
alter table public.profiles drop constraint if exists profiles_driver_approval;
alter table public.profiles drop column if exists female_transport_eligible;

alter table public.profiles add column if not exists department_code text;
alter table public.profiles add column if not exists department_name text;
alter table public.profiles add column if not exists institutional_id text;
alter table public.profiles add column if not exists student_id text;
alter table public.profiles add column if not exists profile_image text;
alter table public.profiles add column if not exists is_verified boolean;
alter table public.profiles add column if not exists approval_status text;
alter table public.profiles add column if not exists registration_status text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'employee_id'
  ) then
    execute 'update public.profiles set institutional_id = employee_id where institutional_id is null and employee_id is not null';
  end if;
end $$;
update public.profiles
set institutional_id = split_part(email, '@', 1)
where user_type = 'STUDENT' and institutional_id is null;
update public.profiles
set student_id = substring(lower(email) from '^u\d{4}(\d{3})@student\.cuet\.ac\.bd$')
where user_type = 'STUDENT' and student_id is null;
alter table public.profiles drop column if exists employee_id;

update public.profiles set user_type = 'TRANSPORT_ADMIN' where user_type = 'ADMIN';
update public.profiles set is_verified = true where is_verified is null;
update public.profiles
set approval_status = case when user_type = 'DRIVER' then 'PENDING' else 'APPROVED' end
where approval_status is null;
update public.profiles
set registration_status = case when user_type = 'DRIVER' then 'PENDING_APPROVAL' else 'VERIFIED' end
where registration_status is null;
update public.profiles set department_code = case department_name
  when 'Civil Engineering' then '01'
  when 'Electrical and Electronic Engineering' then '02'
  when 'Mechanical Engineering' then '03'
  when 'Computer Science and Engineering' then '04'
  when 'Urban and Regional Planning' then '05'
  when 'Architecture' then '06'
  when 'Petroleum and Mining Engineering' then '07'
  when 'Biomedical Engineering' then '08'
  when 'Mechanical and Industrial Engineering' then '09'
  when 'Materials and Metallurgical Engineering' then '10'
  when 'Electronics and Telecommunication Engineering' then '11'
  when 'Water Resources Engineering' then '12'
end where department_code is null and department_name is not null;

alter table public.profiles alter column is_verified set default false;
alter table public.profiles alter column is_verified set not null;
alter table public.profiles alter column approval_status set default 'APPROVED';
alter table public.profiles alter column approval_status set not null;
alter table public.profiles alter column registration_status set default 'PENDING_VERIFICATION';
alter table public.profiles alter column registration_status set not null;

alter table public.profiles add constraint profiles_user_type_check
  check (user_type in ('STUDENT', 'TEACHER', 'STAFF', 'DRIVER', 'TRANSPORT_ADMIN'));
alter table public.profiles add constraint profiles_department_code_check
  check (department_code is null or department_code in ('01','02','03','04','05','06','07','08','09','10','11','12'));
alter table public.profiles add constraint profiles_approval_status_check
  check (approval_status in ('PENDING', 'APPROVED', 'REJECTED'));
alter table public.profiles add constraint profiles_registration_status_check
  check (registration_status in ('PENDING_VERIFICATION', 'PENDING_APPROVAL', 'VERIFIED', 'APPROVED', 'REJECTED'));
alter table public.profiles add constraint profiles_student_identity check (
  (user_type = 'STUDENT' and student_id is not null)
  or (user_type <> 'STUDENT' and student_id is null)
) not valid;
alter table public.profiles add constraint profiles_driver_approval check (
  (user_type = 'DRIVER') or approval_status = 'APPROVED'
);

drop index if exists public.profiles_role_idx;
drop index if exists public.profiles_employee_id_unique;
drop index if exists public.profiles_student_id_unique;
create unique index if not exists profiles_email_unique on public.profiles (lower(email));
create unique index if not exists profiles_institutional_id_unique on public.profiles (institutional_id) where institutional_id is not null;
create index if not exists profiles_student_id_idx on public.profiles (student_id) where student_id is not null;
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
alter table public.email_verifications enable row level security;
revoke all on table public.email_verifications from anon, authenticated;

notify pgrst, 'reload schema';
