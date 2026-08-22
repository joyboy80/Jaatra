-- approval_status is retained for compatibility but no longer controls Driver access or assignment.
update public.profiles
set approval_status = 'APPROVED', registration_status = 'VERIFIED'
where user_type = 'DRIVER' and is_verified and is_active;

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

notify pgrst, 'reload schema';
