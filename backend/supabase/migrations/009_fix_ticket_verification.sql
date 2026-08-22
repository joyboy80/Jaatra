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
  
  if v_trip.driver_profile_id is distinct from p_driver_profile_id then
    select coalesce(
      (select bus_id from public.driver_assignments where driver_profile_id=p_driver_profile_id),
      (select id from public.buses where lower(assigned_driver_name)=lower(v_driver.full_name) limit 1)
    ) into v_assigned_bus;
    
    if v_assigned_bus is distinct from v_trip.bus_id then 
      raise exception 'Trip is not assigned to this Driver' using errcode='42501'; 
    end if;
  end if;

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
