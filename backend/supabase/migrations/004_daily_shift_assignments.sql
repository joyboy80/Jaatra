-- Daily operational assignments are the source of truth for passenger access.
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
create unique index if not exists transport_trips_assignment_direction_unique on public.transport_trips(assignment_id, direction) where assignment_id is not null;
create index if not exists transport_assignments_date_idx on public.transport_assignments(service_date, status);
create index if not exists transport_trips_assignment_idx on public.transport_trips(assignment_id, service_date);

create or replace function public.validate_transport_assignment()
returns trigger language plpgsql security invoker set search_path = public as $$
declare other_assignment public.transport_assignments%rowtype;
begin
  if not exists (select 1 from public.profiles where id = new.driver_profile_id and user_type = 'DRIVER' and is_verified and is_active) then
    raise exception 'Driver must be verified, active, and have the DRIVER role' using errcode = '42501';
  end if;
  select * into other_assignment from public.transport_assignments
   where service_date = new.service_date and status = 'ACTIVE' and id <> coalesce(new.id, '')
     and (bus_id = new.bus_id or driver_profile_id = new.driver_profile_id)
     and shift = new.shift limit 1;
  if found then raise exception 'The selected bus or Driver already has an overlapping assignment' using errcode = '23P01'; end if;
  return new;
end $$;
drop trigger if exists transport_assignments_validate on public.transport_assignments;
create trigger transport_assignments_validate before insert or update on public.transport_assignments for each row execute function public.validate_transport_assignment();
drop trigger if exists transport_assignments_set_updated_at on public.transport_assignments;
create trigger transport_assignments_set_updated_at before update on public.transport_assignments for each row execute function public.set_updated_at();

create or replace function public.reserve_transport_seat(p_profile_id uuid, p_trip_id text, p_travel_date date, p_seat_number text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_profile public.profiles%rowtype; v_trip public.transport_trips%rowtype; v_assignment public.transport_assignments%rowtype; v_bus public.buses%rowtype;
  v_booking_id text := 'BKG-' || upper(substr(md5(clock_timestamp()::text || random()::text), 1, 12)); v_ticket_id text := 'TKT-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 12));
  v_reservation public.reservations%rowtype; v_ticket public.tickets%rowtype; v_seat_position integer;
begin
  if p_travel_date < (timezone('Asia/Dhaka',now()))::date then raise exception 'Travel date cannot be in the past' using errcode='22007'; end if;
  select * into strict v_profile from public.profiles where id=p_profile_id and is_active and is_verified;
  select * into strict v_trip from public.transport_trips where id=p_trip_id and service_date=p_travel_date;
  select * into strict v_assignment from public.transport_assignments where id=v_trip.assignment_id and status='ACTIVE';
  if v_trip.reservation_status <> 'OPEN' or v_trip.operational_status in ('CANCELLED','INACTIVE','COMPLETED') then raise exception 'Reservations are closed for this trip' using errcode='22000'; end if;
  if (v_assignment.passenger_group='ALL_STUDENTS' and v_profile.user_type <> 'STUDENT')
    or (v_assignment.passenger_group='FEMALE_STUDENTS' and (v_profile.user_type <> 'STUDENT' or v_profile.gender <> 'FEMALE'))
    or (v_assignment.passenger_group='ALL_TEACHERS' and v_profile.user_type <> 'TEACHER')
    or (v_assignment.passenger_group='ALL_STAFF' and v_profile.user_type <> 'STAFF')
    or (v_assignment.passenger_group='ALL_USERS' and v_profile.user_type not in ('STUDENT','TEACHER','STAFF')) then raise exception 'This trip is unavailable to your profile' using errcode='42501'; end if;
  if p_travel_date=(timezone('Asia/Dhaka',now()))::date and to_timestamp(v_trip.departure_time,'HH12:MI AM')::time <= (timezone('Asia/Dhaka',now()))::time then raise exception 'Reservations close at departure' using errcode='22000'; end if;
  select * into strict v_bus from public.buses where id=v_trip.bus_id;
  v_seat_position := ((regexp_replace(upper(p_seat_number),'[^0-9]','','g')::integer - 1) * 4) + position(right(upper(p_seat_number),1) in 'ABCD');
  if v_seat_position < 1 or v_seat_position > v_bus.capacity then raise exception 'Seat is outside this bus capacity' using errcode='22000'; end if;
  insert into public.reservations (id,ticket_id,profile_id,trip_id,bus_id,travel_date,seat_number,passenger_name,passenger_email,role_label,university_id,bus_name,bus_number,bus_category,route,departure_time,arrival_time)
  values (v_booking_id,v_ticket_id,p_profile_id,p_trip_id,v_bus.id,p_travel_date,upper(p_seat_number),v_profile.full_name,v_profile.email,initcap(replace(v_profile.user_type,'_',' ')),coalesce(v_profile.institutional_id,v_profile.student_id),v_bus.name,v_bus.number,v_bus.category,v_trip.route,v_trip.departure_time,v_trip.arrival_time) returning * into v_reservation;
  insert into public.tickets(id,booking_id,profile_id,qr_payload) values(v_ticket_id,v_booking_id,p_profile_id,v_ticket_id) returning * into v_ticket;
  return jsonb_build_object('reservation',to_jsonb(v_reservation),'ticket',to_jsonb(v_ticket));
exception when unique_violation then raise exception 'That seat has already been reserved' using errcode='23505'; end $$;

alter table public.transport_assignments enable row level security;
revoke all on table public.transport_assignments from anon, authenticated;
