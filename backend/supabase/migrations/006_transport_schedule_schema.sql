-- Self-contained repair migration for daily Transport Admin schedules.
-- Requires the existing profiles, buses, transport_trips, reservations, and notifications tables.

create table if not exists public.transport_assignments (
  id text primary key,
  service_date date not null,
  shift text not null check (shift in ('MORNING','NOON','AFTERNOON')),
  passenger_group text not null check (passenger_group in ('ALL_STUDENTS','FEMALE_STUDENTS','ALL_TEACHERS','ALL_STAFF','ALL_USERS')),
  bus_id text not null references public.buses(id) on delete restrict,
  driver_profile_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','CANCELLED','INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_date, shift, bus_id)
);

alter table public.transport_trips
  add column if not exists assignment_id text references public.transport_assignments(id) on delete cascade,
  add column if not exists service_date date,
  add column if not exists shift text check (shift in ('MORNING','NOON','AFTERNOON')),
  add column if not exists passenger_group text check (passenger_group in ('ALL_STUDENTS','FEMALE_STUDENTS','ALL_TEACHERS','ALL_STAFF','ALL_USERS')),
  add column if not exists driver_profile_id uuid references public.profiles(id) on delete restrict,
  add column if not exists direction text check (direction in ('OUTBOUND','RETURN')),
  add column if not exists reservation_status text not null default 'OPEN' check (reservation_status in ('OPEN','CLOSED')),
  add column if not exists operational_status text not null default 'SCHEDULED' check (operational_status in ('SCHEDULED','BOARDING','IN_PROGRESS','COMPLETED','CANCELLED','INACTIVE'));

create unique index if not exists transport_trips_assignment_direction_unique
  on public.transport_trips(assignment_id, direction) where assignment_id is not null;
create index if not exists transport_assignments_date_idx on public.transport_assignments(service_date, status);
create index if not exists transport_trips_assignment_idx on public.transport_trips(assignment_id, service_date);

create or replace function public.validate_transport_assignment()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare other_assignment public.transport_assignments%rowtype;
begin
  if not exists (
    select 1 from public.profiles
    where id = new.driver_profile_id
      and user_type = 'DRIVER'
      and is_verified
      and is_active
  ) then
    raise exception 'Driver must be registered, verified, active, and have the DRIVER role' using errcode = '42501';
  end if;

  select * into other_assignment
  from public.transport_assignments
  where service_date = new.service_date
    and status = 'ACTIVE'
    and id <> coalesce(new.id, '')
    and shift = new.shift
    and (bus_id = new.bus_id or driver_profile_id = new.driver_profile_id)
  limit 1;

  if found then
    raise exception 'The selected bus or Driver already has an overlapping assignment' using errcode = '23P01';
  end if;
  return new;
end;
$$;

drop trigger if exists transport_assignments_validate on public.transport_assignments;
create trigger transport_assignments_validate
before insert or update on public.transport_assignments
for each row execute function public.validate_transport_assignment();

drop trigger if exists transport_assignments_set_updated_at on public.transport_assignments;
create trigger transport_assignments_set_updated_at
before update on public.transport_assignments
for each row execute function public.set_updated_at();

-- Driver approval is retained only as a legacy field and never gates portal access.
update public.profiles
set approval_status = 'APPROVED', registration_status = 'VERIFIED'
where user_type = 'DRIVER' and is_verified and is_active;

alter table public.transport_assignments enable row level security;
revoke all on table public.transport_assignments from anon, authenticated;

notify pgrst, 'reload schema';
