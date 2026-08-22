import { CalendarDays, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import PortalBusCard from "../../components/bus/PortalBusCard";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { getAllowedBusCategories, parseDepartureMinutes, uniqueValues } from "../../utils/busAccess";
import { getBusesByRole } from "../../services/busService";

function todayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

export default function TodayBusesPage({ role }) {
  const [buses, setBuses] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { getBusesByRole(role).then(setBuses).catch((requestError) => setError(requestError.message)); }, [role]);
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("all");
  const [category, setCategory] = useState("all");
  const [departure, setDeparture] = useState("all");
  const [seatAvailability, setSeatAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("departure");

  const destinations = uniqueValues(buses.flatMap((bus) => bus.stops));
  const categories = getAllowedBusCategories(role);

  const filteredBuses = useMemo(() => {
    return buses
      .filter((bus) => {
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery =
          !normalizedQuery ||
          [bus.name, bus.type, bus.route, bus.nextStop].some((value) => value.toLowerCase().includes(normalizedQuery));
        const matchesDestination = destination === "all" || bus.stops.includes(destination);
        const matchesCategory = category === "all" || bus.type === category;
        const busMinutes = parseDepartureMinutes(bus.departureTime);
        const matchesDeparture =
          departure === "all" ||
          (departure === "morning" && busMinutes < 10 * 60) ||
          (departure === "midday" && busMinutes >= 10 * 60 && busMinutes < 13 * 60);
        const matchesSeats =
          seatAvailability === "all" ||
          (seatAvailability === "available" && bus.availableSeats > 0) ||
          (seatAvailability === "limited" && bus.availableSeats <= 12);

        return matchesQuery && matchesDestination && matchesCategory && matchesDeparture && matchesSeats;
      })
      .sort((left, right) => {
        if (sortBy === "seats") return right.availableSeats - left.availableSeats;
        return parseDepartureMinutes(left.departureTime) - parseDepartureMinutes(right.departureTime);
      });
  }, [buses, category, departure, destination, query, seatAvailability, sortBy]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Today's Buses"
          title="Buses operating today"
          description="Search, filter, and sort the buses available for your transportation role."
          actions={<Badge tone="info">{todayLabel()}</Badge>}
        />

        {error && <ErrorState title="Buses unavailable" message={error} />}
        {!error && <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <label className="block xl:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-safar-ink">Search</span>
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
            <Select label="Destination" value={destination} onChange={(event) => setDestination(event.target.value)}>
              <option value="all">All destinations</option>
              {destinations.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <Select label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <Select label="Departure" value={departure} onChange={(event) => setDeparture(event.target.value)}>
              <option value="all">Any time</option>
              <option value="morning">Before 10 AM</option>
              <option value="midday">10 AM - 1 PM</option>
            </Select>
            <Select label="Sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="departure">Departure time</option>
              <option value="seats">Available seats</option>
            </Select>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select className="sm:max-w-xs" label="Seat availability" value={seatAvailability} onChange={(event) => setSeatAvailability(event.target.value)}>
              <option value="all">All buses</option>
              <option value="available">Seats available</option>
              <option value="limited">Limited seats</option>
            </Select>
            <div className="flex items-center gap-2 text-sm font-semibold text-safar-gray">
              <CalendarDays className="h-4 w-4 text-safar-teal" />
              {filteredBuses.length} result{filteredBuses.length === 1 ? "" : "s"}
            </div>
          </div>
        </section>}

        {!error && (filteredBuses.length > 0 ? (
          <section className="grid gap-4 xl:grid-cols-2">
            {filteredBuses.map((bus) => (
              <PortalBusCard key={bus.id} bus={bus} role={role} />
            ))}
          </section>
        ) : (
          <EmptyState title="No buses match those filters" message="Try another destination, category, departure time, or seat filter." />
        ))}
      </div>
    </DashboardLayout>
  );
}
