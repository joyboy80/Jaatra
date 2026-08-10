create table if not exists public.transport_routes (
  id text primary key,
  name text not null,
  start_point text not null,
  destination text not null,
  stops jsonb not null default '[]'::jsonb check (jsonb_typeof(stops) = 'array'),
  assigned_bus_ids jsonb not null default '[]'::jsonb check (jsonb_typeof(assigned_bus_ids) = 'array'),
  estimated_minutes integer not null default 45 check (estimated_minutes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.buses (
  id text primary key,
  name text not null,
  number text not null unique,
  category text not null check (category in ('Student Bus','Female Student Bus','Teacher Bus','Staff Bus')),
  capacity integer not null check (capacity > 0),
  route text not null,
  stops jsonb not null default '[]'::jsonb check (jsonb_typeof(stops) = 'array'),
  departure_time text not null,
  arrival_time text not null,
  status text not null default 'On Time',
  next_stop text,
  eta_minutes integer not null default 10 check (eta_minutes >= 0),
  location_label text,
  latitude double precision,
  longitude double precision,
  assigned_driver_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transport_trips (
  id text primary key,
  bus_id text not null references public.buses(id) on delete cascade,
  route text not null,
  stops jsonb not null default '[]'::jsonb check (jsonb_typeof(stops) = 'array'),
  departure_time text not null,
  arrival_time text not null,
  status text not null default 'Scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transport_schedules (
  id text primary key,
  trip_id text references public.transport_trips(id) on delete set null,
  bus_id text not null references public.buses(id) on delete cascade,
  service_date date not null,
  departure_time text not null,
  arrival_time text not null,
  schedule_type text not null default 'Regular'
    check (schedule_type in ('Regular','Weekend','Holiday','Exam','Special Event')),
  status text not null default 'Scheduled'
    check (status in ('Upcoming','Scheduled','Boarding','In Progress','Completed','Cancelled','Delayed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id text primary key,
  ticket_id text not null unique,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  trip_id text not null references public.transport_trips(id),
  bus_id text not null references public.buses(id),
  travel_date date not null,
  seat_number text not null check (seat_number ~ '^[1-9][0-9]?[A-D]$'),
  status text not null default 'Confirmed' check (status in ('Confirmed','Cancelled','Used','Expired')),
  passenger_name text not null,
  passenger_email text not null,
  role_label text not null,
  university_id text,
  bus_name text not null,
  bus_number text not null,
  bus_category text not null,
  route text not null,
  departure_time text not null,
  arrival_time text not null,
  boarding_status text not null default 'Not Boarded'
    check (boarding_status in ('Not Boarded','Boarded','Cancelled')),
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists reservations_active_seat_unique
  on public.reservations (trip_id, travel_date, seat_number)
  where status <> 'Cancelled';
create index if not exists reservations_profile_idx on public.reservations (profile_id, created_at desc);
create index if not exists reservations_trip_date_idx on public.reservations (trip_id, travel_date);

create table if not exists public.tickets (
  id text primary key,
  booking_id text not null unique references public.reservations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  qr_payload text not null unique,
  status text not null default 'Confirmed' check (status in ('Confirmed','Cancelled','Used','Expired')),
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tracking_positions (
  bus_id text primary key references public.buses(id) on delete cascade,
  location_label text,
  latitude double precision,
  longitude double precision,
  next_stop text,
  eta_minutes integer not null default 10 check (eta_minutes >= 0),
  speed integer not null default 0 check (speed >= 0),
  status text not null default 'Offline',
  delay_minutes integer not null default 0 check (delay_minutes >= 0),
  progress double precision not null default 0 check (progress between 0 and 1),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'transport',
  title text not null,
  message text not null,
  tone text not null default 'info',
  unread boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists notifications_profile_idx on public.notifications (profile_id, created_at desc);

create table if not exists public.driver_assignments (
  driver_profile_id uuid primary key references public.profiles(id) on delete cascade,
  bus_id text references public.buses(id) on delete set null,
  status text not null default 'Available' check (status in ('Available','On Trip','Off Duty','Emergency','Suspended')),
  completed_trips integer not null default 0 check (completed_trips >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.driver_reports (
  id text primary key,
  driver_profile_id uuid not null references public.profiles(id) on delete cascade,
  bus_id text references public.buses(id) on delete set null,
  trip_id text references public.transport_trips(id) on delete set null,
  report_type text not null check (report_type in ('CONDITION','DELAY','EMERGENCY')),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  status text not null default 'Sent',
  created_at timestamptz not null default now()
);

create table if not exists public.maintenance_records (
  id text primary key,
  bus_id text not null unique references public.buses(id) on delete cascade,
  condition text not null default 'Good',
  last_maintenance date,
  next_maintenance date,
  reported_issue text not null default 'No open issue',
  status text not null default 'Good',
  updated_at timestamptz not null default now()
);

create or replace function public.apply_driver_report()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare v_delay integer;
begin
  if new.report_type = 'CONDITION' and new.bus_id is not null then
    insert into public.maintenance_records (id,bus_id,condition,last_maintenance,next_maintenance,reported_issue,status)
    values (
      'MNT-' || upper(substr(md5(new.id),1,12)),new.bus_id,coalesce(new.payload->>'condition','Needs Review'),
      (timezone('Asia/Dhaka',now()))::date,(timezone('Asia/Dhaka',now()))::date + 60,coalesce(new.payload->>'description','Driver condition report'),
      case when lower(coalesce(new.payload->>'condition','')) like '%critical%' then 'Under Maintenance' else coalesce(new.payload->>'condition','Needs Review') end
    )
    on conflict (bus_id) do update set
      condition=excluded.condition,reported_issue=excluded.reported_issue,status=excluded.status,updated_at=now();
  elsif new.report_type = 'DELAY' and new.bus_id is not null then
    v_delay := coalesce(nullif(regexp_replace(coalesce(new.payload->>'estimatedDelay','10'),'[^0-9]','','g'),''),'10')::integer;
    update public.tracking_positions set status='Delayed',delay_minutes=v_delay,updated_at=now() where bus_id=new.bus_id;
  elsif new.report_type = 'EMERGENCY' then
    insert into public.driver_assignments (driver_profile_id,bus_id,status)
    values (new.driver_profile_id,new.bus_id,'Emergency')
    on conflict (driver_profile_id) do update set status='Emergency',bus_id=coalesce(excluded.bus_id,driver_assignments.bus_id),updated_at=now();
  end if;
  return new;
end;
$$;

drop trigger if exists driver_reports_apply on public.driver_reports;
create trigger driver_reports_apply after insert on public.driver_reports
for each row execute function public.apply_driver_report();

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'transport_routes','buses','transport_trips','transport_schedules','reservations','tickets',
    'tracking_positions','notifications','driver_assignments','driver_reports','maintenance_records'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
  end loop;
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'transport_routes','buses','transport_trips','transport_schedules','reservations','tickets',
    'tracking_positions','driver_assignments','maintenance_records'
  ] loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_set_updated_at', table_name);
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', table_name || '_set_updated_at', table_name);
  end loop;
end $$;

with source as (
  select
    i,
    (array['Surma','Meghna','Padma','Jamuna','Brahmaputra','Karnaphuli','Teesta','Madhumati','Atrai','Buriganga','Shitalakshya','Dhaleshwari','Rupsa','Pasur','Sangu','Halda','Gorai','Kushiyara'])[i] as bus_name,
    (array['Student Bus','Female Student Bus','Teacher Bus','Staff Bus'])[((i - 1) % 4) + 1] as category,
    (array['Main Campus','Science Annex','Central Library','Medical Gate','North Hall','South Hall','Faculty Quarter','Transport Yard'])[((i - 1) % 8) + 1] as route_start,
    (array['Main Campus','Science Annex','Central Library','Medical Gate','North Hall','South Hall','Faculty Quarter','Transport Yard'])[((i + 2) % 8) + 1] as route_end,
    (array['Abdul Karim','Mizan Rahman','Farhana Akter','Sabbir Hossain','Nusrat Jahan','Imran Chowdhury'])[((i - 1) % 6) + 1] as driver_name
  from generate_series(1, 18) i
)
insert into public.buses (
  id,name,number,category,capacity,route,stops,departure_time,arrival_time,status,next_stop,
  eta_minutes,location_label,latitude,longitude,assigned_driver_name
)
select
  'BUS-' || lpad(i::text, 3, '0'), bus_name, 'JA-' || (2019 + i)::text, category,
  case when i % 4 = 2 then 36 when i % 4 = 3 then 28 else 44 end,
  route_start || ' - ' || route_end,
  jsonb_build_array(route_start, route_end),
  lpad((7 + ((i - 1) % 6))::text, 2, '0') || ':15 AM',
  lpad((8 + ((i - 1) % 6))::text, 2, '0') || ':05 AM',
  (array['On Time','Boarding','En Route','Delayed','Arrived'])[((i - 1) % 5) + 1],
  route_end, 5 + i, route_start || ' Road', 23.74 + i * 0.004, 90.38 + i * 0.003, driver_name
from source
on conflict (id) do nothing;

insert into public.transport_routes (id,name,start_point,destination,stops,assigned_bus_ids,estimated_minutes)
select
  'RTE-' || lpad(row_number() over (order by route)::text, 3, '0'),
  'Campus Route ' || chr(64 + row_number() over (order by route)::integer),
  split_part(route, ' - ', 1), split_part(route, ' - ', 2), (jsonb_agg(stops order by id)->0),
  jsonb_agg(id order by id), 40 + row_number() over (order by route)::integer * 5
from public.buses
group by route
on conflict (id) do nothing;

insert into public.transport_trips (id,bus_id,route,stops,departure_time,arrival_time,status)
select b.id || '-' || template.suffix, b.id, b.route, b.stops, template.departure_time, template.arrival_time,
  case when template.suffix = 'D1' then 'Scheduled' else b.status end
from public.buses b
cross join (values
  ('M1','07:30 AM','08:20 AM'),
  ('D1','10:00 AM','10:55 AM'),
  ('E1','04:30 PM','05:25 PM')
) template(suffix,departure_time,arrival_time)
on conflict (id) do nothing;

insert into public.transport_schedules (id,trip_id,bus_id,service_date,departure_time,arrival_time,schedule_type,status)
select 'SCH-' || lpad(row_number() over (order by t.id)::text, 3, '0'), t.id, t.bus_id, (timezone('Asia/Dhaka',now()))::date,
  t.departure_time, t.arrival_time, 'Regular', 'Scheduled'
from public.transport_trips t
order by t.id
limit 18
on conflict (id) do nothing;

insert into public.tracking_positions (bus_id,location_label,latitude,longitude,next_stop,eta_minutes,speed,status,delay_minutes,progress)
select id,location_label,latitude,longitude,next_stop,eta_minutes,
  case when status in ('Arrived') then 0 else 24 end,
  case when status = 'En Route' then 'Running' else status end,
  case when status = 'Delayed' then 10 else 0 end,
  ((substring(id from '[0-9]+')::integer * 7) % 100)::double precision / 100
from public.buses
on conflict (bus_id) do nothing;

insert into public.maintenance_records (id,bus_id,condition,last_maintenance,next_maintenance,reported_issue,status)
select 'MNT-' || lpad(row_number() over (order by id)::text, 3, '0'), id,
  case when row_number() over (order by id) = 3 then 'Critical' else 'Good' end,
  (timezone('Asia/Dhaka',now()))::date - 30, (timezone('Asia/Dhaka',now()))::date + 60,
  case when row_number() over (order by id) = 3 then 'Brake pressure requires inspection' else 'No open issue' end,
  case when row_number() over (order by id) = 3 then 'Under Maintenance' else 'Good' end
from public.buses
order by id
limit 8
on conflict (id) do nothing;

create or replace function public.reserve_transport_seat(
  p_profile_id uuid,
  p_trip_id text,
  p_travel_date date,
  p_seat_number text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_trip public.transport_trips%rowtype;
  v_bus public.buses%rowtype;
  v_booking_id text := 'BKG-' || upper(substr(md5(clock_timestamp()::text || random()::text), 1, 12));
  v_ticket_id text := 'TKT-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 12));
  v_reservation public.reservations%rowtype;
  v_ticket public.tickets%rowtype;
  v_seat_position integer;
begin
  if p_travel_date < (timezone('Asia/Dhaka',now()))::date then raise exception 'Travel date cannot be in the past' using errcode = '22007'; end if;
  select * into strict v_profile from public.profiles where id = p_profile_id and is_active and is_verified;
  select * into strict v_trip from public.transport_trips where id = p_trip_id;
  select * into strict v_bus from public.buses where id = v_trip.bus_id;
  if (v_profile.user_type = 'STUDENT' and v_bus.category not in ('Student Bus','Female Student Bus'))
    or (v_profile.user_type = 'TEACHER' and v_bus.category <> 'Teacher Bus')
    or (v_profile.user_type = 'STAFF' and v_bus.category <> 'Staff Bus') then
    raise exception 'This bus category is not available to the passenger role' using errcode = '42501';
  end if;
  v_seat_position := ((regexp_replace(upper(p_seat_number),'[^0-9]','','g')::integer - 1) * 4)
    + position(right(upper(p_seat_number),1) in 'ABCD');
  if v_seat_position < 1 or v_seat_position > v_bus.capacity then
    raise exception 'Seat is outside this bus capacity' using errcode = '22000';
  end if;

  insert into public.reservations (
    id,ticket_id,profile_id,trip_id,bus_id,travel_date,seat_number,passenger_name,passenger_email,
    role_label,university_id,bus_name,bus_number,bus_category,route,departure_time,arrival_time
  ) values (
    v_booking_id,v_ticket_id,p_profile_id,p_trip_id,v_bus.id,p_travel_date,upper(p_seat_number),v_profile.full_name,v_profile.email,
    initcap(replace(v_profile.user_type,'_',' ')),coalesce(v_profile.institutional_id,v_profile.student_id),
    v_bus.name,v_bus.number,v_bus.category,v_trip.route,v_trip.departure_time,v_trip.arrival_time
  ) returning * into v_reservation;

  insert into public.tickets (id,booking_id,profile_id,qr_payload)
  values (v_ticket_id,v_booking_id,p_profile_id,v_ticket_id)
  returning * into v_ticket;

  insert into public.notifications (id,profile_id,type,title,message,tone)
  values ('NTF-' || upper(substr(md5(random()::text),1,12)),p_profile_id,'reservation','Reservation confirmed',
    'Your seat on ' || v_bus.name || ' has been confirmed.','success');

  return jsonb_build_object('reservation',to_jsonb(v_reservation),'ticket',to_jsonb(v_ticket));
exception
  when unique_violation then raise exception 'That seat has already been reserved' using errcode = '23505';
end;
$$;

create or replace function public.cancel_transport_reservation(p_profile_id uuid, p_booking_id text)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare v_reservation public.reservations%rowtype;
begin
  select * into strict v_reservation from public.reservations
  where id=p_booking_id and profile_id=p_profile_id and status='Confirmed' for update;
  if v_reservation.travel_date < (timezone('Asia/Dhaka',now()))::date
    or (v_reservation.travel_date = (timezone('Asia/Dhaka',now()))::date
      and to_timestamp(v_reservation.departure_time,'HH12:MI AM')::time <= (timezone('Asia/Dhaka',now()))::time) then
    raise exception 'A trip cannot be cancelled after departure' using errcode='22000';
  end if;
  update public.reservations set status='Cancelled',boarding_status='Cancelled',cancelled_at=now()
  where id=p_booking_id returning * into v_reservation;
  update public.tickets set status='Cancelled' where booking_id=p_booking_id;
  insert into public.notifications (id,profile_id,type,title,message,tone)
  values ('NTF-' || upper(substr(md5(random()::text),1,12)),p_profile_id,'cancellation','Reservation cancelled',
    'Your scheduled trip on ' || v_reservation.bus_name || ' has been cancelled.','danger');
  return v_reservation;
end;
$$;

create or replace function public.verify_transport_ticket(p_driver_profile_id uuid, p_ticket_id text, p_trip_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver public.profiles%rowtype;
  v_trip public.transport_trips%rowtype;
  v_ticket public.tickets%rowtype;
  v_reservation public.reservations%rowtype;
  v_assigned_bus text;
begin
  select * into strict v_driver from public.profiles where id=p_driver_profile_id and user_type='DRIVER' and is_active;
  select * into strict v_trip from public.transport_trips where id=p_trip_id;
  select coalesce(
    (select bus_id from public.driver_assignments where driver_profile_id=p_driver_profile_id),
    (select id from public.buses where lower(assigned_driver_name)=lower(v_driver.full_name) limit 1)
  ) into v_assigned_bus;
  if v_assigned_bus is distinct from v_trip.bus_id then raise exception 'Trip is not assigned to this Driver' using errcode='42501'; end if;
  select * into strict v_ticket from public.tickets where id=upper(p_ticket_id) for update;
  select * into strict v_reservation from public.reservations where id=v_ticket.booking_id for update;
  if v_reservation.trip_id <> p_trip_id or v_reservation.bus_id <> v_trip.bus_id then raise exception 'Ticket is for a different trip' using errcode='22000'; end if;
  if v_reservation.travel_date <> (timezone('Asia/Dhaka',now()))::date then raise exception 'Ticket is not valid today' using errcode='22007'; end if;
  if v_ticket.status <> 'Confirmed' or v_reservation.status <> 'Confirmed' then raise exception 'Ticket is not active' using errcode='22000'; end if;
  update public.tickets set status='Used',used_at=now() where id=v_ticket.id returning * into v_ticket;
  update public.reservations set status='Used',boarding_status='Boarded' where id=v_reservation.id returning * into v_reservation;
  return jsonb_build_object('ticket',to_jsonb(v_ticket),'reservation',to_jsonb(v_reservation));
end;
$$;

revoke all on function public.reserve_transport_seat(uuid,text,date,text) from public, anon, authenticated;
revoke all on function public.cancel_transport_reservation(uuid,text) from public, anon, authenticated;
revoke all on function public.verify_transport_ticket(uuid,text,text) from public, anon, authenticated;
grant execute on function public.reserve_transport_seat(uuid,text,date,text) to service_role;
grant execute on function public.cancel_transport_reservation(uuid,text) to service_role;
grant execute on function public.verify_transport_ticket(uuid,text,text) to service_role;

-- Make newly created transport tables and functions visible to PostgREST
-- immediately after this migration completes in the Supabase SQL editor.
notify pgrst, 'reload schema';
