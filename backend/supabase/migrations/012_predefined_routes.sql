-- Migration: 012_predefined_routes.sql
-- Restructure routes to 4 predefined database-driven routes with strictly ordered stoppages

-- 1. Ensure direction column exists on transport_routes
alter table public.transport_routes
  add column if not exists direction text;

-- 2. Ensure route_id exists on transport_trips and reservations
alter table public.transport_trips
  add column if not exists route_id text references public.transport_routes(id) on delete set null;

alter table public.reservations
  add column if not exists route_id text references public.transport_routes(id) on delete set null;

create index if not exists transport_trips_route_id_idx on public.transport_trips(route_id);
create index if not exists reservations_route_id_idx on public.reservations(route_id);

-- 3. Upsert the 5 predefined routes
insert into public.transport_routes (id, name, direction, start_point, destination, stops, estimated_minutes, updated_at)
values
  (
    'CUET_STATION_DIRECT',
    'Route 1 — Direct via Flyover',
    'CUET → Station',
    'CUET Campus',
    'Station',
    '["CUET Campus", "Noapara", "Rastar Matha", "Bahaddarhat", "Muradpur Flyover", "Lalkhan Bazar", "Station"]'::jsonb,
    75,
    now()
  ),
  (
    'CUET_STATION_GEC',
    'Route 2 — via GEC',
    'CUET → Station',
    'CUET Campus',
    'Station',
    '["CUET Campus", "Noapara", "Rastar Matha", "Bahaddarhat", "Muradpur", "2 No. Gate", "GEC", "Wasa", "Lalkhan Bazar", "Station"]'::jsonb,
    75,
    now()
  ),
  (
    'CUET_STATION_FLYOVER_GEC',
    'Route 3 — via Flyover & GEC',
    'CUET → Station',
    'CUET Campus',
    'Station',
    '["CUET Campus", "Noapara", "Rastar Matha", "Bahaddarhat", "Muradpur Flyover", "GEC", "Wasa", "Lalkhan Bazar", "Station"]'::jsonb,
    75,
    now()
  ),
  (
    'STATION_CUET_BAHADDARHAT',
    'Route 4 — Return via Bahaddarhat',
    'Station → CUET',
    'Station',
    'CUET',
    '["Station", "Lalkhan Bazar", "Flyover", "Bahaddarhat", "Rastar Matha", "Noapara", "CUET"]'::jsonb,
    80,
    now()
  ),
  (
    'STATION_CUET_GEC',
    'Route 5 — Return via GEC',
    'Station → CUET',
    'Station',
    'CUET Campus',
    '["Station", "Lalkhan Bazar", "Wasa", "GEC", "2 No. Gate", "Muradpur", "Bahaddarhat", "Rastar Matha", "Noapara", "CUET Campus"]'::jsonb,
    80,
    now()
  )
on conflict (id) do update set
  name = excluded.name,
  direction = excluded.direction,
  start_point = excluded.start_point,
  destination = excluded.destination,
  stops = excluded.stops,
  estimated_minutes = excluded.estimated_minutes,
  updated_at = now();

-- 4. Update buses to point to the predefined routes where matching or unassigned
update public.buses
set
  route_id = case
    when lower(route) like '%flyover%' and lower(route) like '%gec%' then 'CUET_STATION_FLYOVER_GEC'
    when lower(route) like '%gec%' and lower(route) like '%cuet%' and position('station' in lower(route)) < position('cuet' in lower(route)) then 'STATION_CUET_GEC'
    when lower(route) like '%station%' and lower(route) like '%cuet%' and position('station' in lower(route)) < position('cuet' in lower(route)) then 'STATION_CUET_BAHADDARHAT'
    when lower(route) like '%gec%' then 'CUET_STATION_GEC'
    else 'CUET_STATION_DIRECT'
  end,
  route = case
    when lower(route) like '%flyover%' and lower(route) like '%gec%' then 'Route 3 — via Flyover & GEC'
    when lower(route) like '%gec%' and lower(route) like '%cuet%' and position('station' in lower(route)) < position('cuet' in lower(route)) then 'Route 5 — Return via GEC'
    when lower(route) like '%station%' and lower(route) like '%cuet%' and position('station' in lower(route)) < position('cuet' in lower(route)) then 'Route 4 — Return via Bahaddarhat'
    when lower(route) like '%gec%' then 'Route 2 — via GEC'
    else 'Route 1 — Direct via Flyover'
  end
where route_id is null or route_id not in ('CUET_STATION_DIRECT', 'CUET_STATION_GEC', 'CUET_STATION_FLYOVER_GEC', 'STATION_CUET_BAHADDARHAT', 'STATION_CUET_GEC');

-- 5. Backfill assigned_bus_ids for all predefined routes
update public.transport_routes r
set assigned_bus_ids = coalesce(
  (
    select jsonb_agg(b.id order by b.id)
    from public.buses b
    where b.route_id = r.id
  ),
  '[]'::jsonb
)
where r.id in ('CUET_STATION_DIRECT', 'CUET_STATION_GEC', 'CUET_STATION_FLYOVER_GEC', 'STATION_CUET_BAHADDARHAT', 'STATION_CUET_GEC');

-- 6. Backfill transport_trips route_id and stops
update public.transport_trips t
set
  route_id = case
    when t.direction = 'RETURN' and lower(t.route) like '%gec%' then 'STATION_CUET_GEC'
    when t.direction = 'RETURN' then 'STATION_CUET_BAHADDARHAT'
    when lower(t.route) like '%flyover%' and lower(t.route) like '%gec%' then 'CUET_STATION_FLYOVER_GEC'
    when lower(t.route) like '%gec%' then 'CUET_STATION_GEC'
    else 'CUET_STATION_DIRECT'
  end
where t.route_id is null;

-- 7. Backfill reservations route_id from trips or buses
update public.reservations r
set route_id = coalesce(t.route_id, b.route_id, 'CUET_STATION_DIRECT')
from public.transport_trips t, public.buses b
where r.trip_id = t.id and r.bus_id = b.id and r.route_id is null;

notify pgrst, 'reload schema';
