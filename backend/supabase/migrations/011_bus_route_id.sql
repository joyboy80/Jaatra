-- Migration: 011_bus_route_id.sql
-- Add route_id foreign key reference to buses table

alter table public.buses
  add column if not exists route_id text references public.transport_routes(id) on delete set null;

-- Index on route_id for fast lookups
create index if not exists buses_route_id_idx on public.buses(route_id);

-- Backfill route_id for existing buses by matching route names with transport_routes
update public.buses b
set route_id = r.id
from public.transport_routes r
where b.route_id is null
  and (
    lower(b.route) = lower(r.name)
    or lower(b.route) = lower(r.start_point || ' - ' || r.destination)
    or lower(b.route) = lower(r.start_point || ' to ' || r.destination)
  );

-- Backfill assigned_bus_ids in transport_routes
update public.transport_routes r
set assigned_bus_ids = (
  select coalesce(jsonb_agg(b.id), '[]'::jsonb)
  from public.buses b
  where b.route_id = r.id
);

notify pgrst, 'reload schema';
