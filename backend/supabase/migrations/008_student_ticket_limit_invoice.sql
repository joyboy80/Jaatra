create table if not exists public.invoices (
  id text primary key,
  invoice_number text not null unique,
  booking_id text not null unique references public.reservations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  issue_date timestamptz not null default now(),
  subtotal numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  fees numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  currency text not null default 'BDT',
  payment_status text not null default 'Paid',
  created_at timestamptz not null default now()
);

alter table public.invoices enable row level security;
revoke all on table public.invoices from anon, authenticated;

-- Delete any existing duplicate active reservations for the same student, trip, and date.
-- This ensures the unique index can be created successfully.
with duplicates as (
  select id,
         row_number() over (partition by profile_id, trip_id, travel_date order by created_at asc) as rn
  from public.reservations
  where status <> 'Cancelled'
)
update public.reservations
set status = 'Cancelled', cancelled_at = now()
where id in (select id from duplicates where rn > 1);

-- Create partial unique index to enforce one active ticket per student per departure
create unique index if not exists reservations_one_ticket_per_departure_idx 
on public.reservations (profile_id, trip_id, travel_date) 
where status <> 'Cancelled';


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
  v_invoice_id text := 'INV-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 12));
  v_invoice_number text := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  v_reservation public.reservations%rowtype;
  v_ticket public.tickets%rowtype;
  v_invoice public.invoices%rowtype;
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
  
  insert into public.invoices (id, invoice_number, booking_id, profile_id, subtotal, tax, fees, discount, total, currency, payment_status)
  values (v_invoice_id, v_invoice_number, v_booking_id, p_profile_id, 0.00, 0.00, 0.00, 0.00, 0.00, 'BDT', 'Paid')
  returning * into v_invoice;

  insert into public.notifications (id,profile_id,type,title,message,tone)
  values ('NTF-' || upper(substr(md5(random()::text),1,12)),p_profile_id,'reservation','Reservation confirmed',
    'Your seat on ' || v_bus.name || ' has been confirmed.','success');

  return jsonb_build_object('reservation',to_jsonb(v_reservation),'ticket',to_jsonb(v_ticket),'invoice',to_jsonb(v_invoice));
exception
  when unique_violation then
    if sqlerrm like '%reservations_one_ticket_per_departure_idx%' then
      raise exception 'TICKET_LIMIT_REACHED' using errcode = '23505';
    else
      raise exception 'That seat has already been reserved' using errcode = '23505';
    end if;
end;
$$;

notify pgrst, 'reload schema';
