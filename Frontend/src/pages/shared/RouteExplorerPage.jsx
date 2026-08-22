import { ArrowRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Select from "../../components/common/Select";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { parseDepartureMinutes, uniqueValues } from "../../utils/busAccess";
import { getBusesByRole } from "../../services/busService";

function travelTime(bus) {
  const minutes = parseDepartureMinutes(bus.arrivalTime) - parseDepartureMinutes(bus.departureTime);
  return Number.isFinite(minutes) && minutes > 0 ? `${minutes} min` : "Unavailable";
}

export default function RouteExplorerPage({ role }) {
  const [buses, setBuses] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { getBusesByRole(role).then(setBuses).catch((requestError) => setError(requestError.message)); }, [role]);
  const stops = uniqueValues(buses.flatMap((bus) => bus.stops));
  const [query, setQuery] = useState("");
  const [start, setStart] = useState("all");
  const [destination, setDestination] = useState("all");

  const visibleRoutes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return buses.filter((bus) => {
      const matchesQuery =
        !normalizedQuery ||
        [bus.name, bus.route, ...bus.stops].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesStart = start === "all" || bus.stops.includes(start);
      const matchesDestination = destination === "all" || bus.stops.includes(destination);

      return matchesQuery && matchesStart && matchesDestination;
    });
  }, [buses, destination, query, start]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Route Explorer"
          title="Find available routes"
          description="Search by route, choose a starting point and destination, then view buses available for your role."
        />

        {error && <ErrorState title="Routes unavailable" message={error} />}
        {!error && <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-safar-ink">Search routes</span>
              <span className="relative block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-safar-gray" />
                <input
                  className="focus-ring h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-safar-ink"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search bus, route, stop"
                />
              </span>
            </label>
            <Select label="Starting location" value={start} onChange={(event) => setStart(event.target.value)}>
              <option value="all">Any starting point</option>
              {stops.map((stop) => (
                <option key={stop} value={stop}>{stop}</option>
              ))}
            </Select>
            <Select label="Destination" value={destination} onChange={(event) => setDestination(event.target.value)}>
              <option value="all">Any destination</option>
              {stops.map((stop) => (
                <option key={stop} value={stop}>{stop}</option>
              ))}
            </Select>
          </div>
        </section>}

        {!error && (visibleRoutes.length > 0 ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {visibleRoutes.map((bus) => (
              <article key={bus.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-safar-ink">{bus.route}</h2>
                  <p className="mt-1 text-sm text-safar-gray">{bus.name} / {bus.type}</p>
                </div>
                <Badge tone="success">{bus.availableSeats} seats</Badge>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-safar-gray">
                {bus.stops.map((stop, index) => (
                  <span key={stop} className="inline-flex items-center gap-2">
                    <span>{stop}</span>
                    {index < bus.stops.length - 1 && <ArrowRight className="h-4 w-4 text-safar-teal" />}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                <div><p className="font-semibold text-safar-gray">Departure</p><p className="mt-1 text-safar-ink">{bus.departureTime}</p></div>
                <div><p className="font-semibold text-safar-gray">Arrival</p><p className="mt-1 text-safar-ink">{bus.arrivalTime}</p></div>
                <div><p className="font-semibold text-safar-gray">Travel time</p><p className="mt-1 text-safar-ink">{travelTime(bus)}</p></div>
              </div>
              </article>
            ))}
          </section>
        ) : (
          <EmptyState title="No routes found" message="Try another start, destination, or route search." />
        ))}
      </div>
    </DashboardLayout>
  );
}
