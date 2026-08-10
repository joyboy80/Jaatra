import { BusFront, Clock, MapPinned, Navigation, Ticket, Users } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import Badge from "../../components/common/Badge";
import StatCard from "../../components/common/StatCard";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getBusForRole } from "../../utils/busAccess";

export default function BusDetailsPage({ role }) {
  const { id } = useParams();
  const bus = getBusForRole(role, id);

  if (!bus) {
    return <Navigate to={`/${role}/today-buses`} replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow={bus.type}
          title={`${bus.name} details`}
          description={`${bus.route} / ${bus.departureTime} - ${bus.arrivalTime}`}
          actions={
            <>
              <Link
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-jaatra-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-jaatra-navy"
                to={`/${role}/reservations/new?busId=${encodeURIComponent(bus.id)}`}
              >
                <Ticket className="h-4 w-4" />
                Reserve Seat
              </Link>
              <Link
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-jaatra-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                to={`/${role}/tracking`}
              >
                <Navigation className="h-4 w-4" />
                Track Bus
              </Link>
            </>
          }
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={BusFront} label="Bus number" value={bus.number} helper={bus.id} />
          <StatCard icon={Users} label="Capacity" value={bus.capacity} helper={`${bus.availableSeats} available`} />
          <StatCard icon={Clock} label="ETA" value={bus.eta} helper={`Next: ${bus.nextStop}`} />
          <StatCard icon={MapPinned} label="Status" value={bus.status} helper={bus.currentLocation.label} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-jaatra-ink">Route stops</h2>
              <Badge tone="info">{bus.stops.length} stops</Badge>
            </div>
            <ol className="mt-5 space-y-4">
              {bus.stops.map((stop, index) => (
                <li key={stop} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-jaatra-mint text-sm font-bold text-jaatra-teal">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-jaatra-ink">{stop}</p>
                    <p className="text-sm text-jaatra-gray">{index === 0 ? "Starting point" : index === bus.stops.length - 1 ? "Destination" : "Intermediate stop"}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-bold text-jaatra-ink">Trip information</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="font-semibold text-jaatra-gray">Category</dt><dd className="mt-1 text-jaatra-ink">{bus.type}</dd></div>
                <div><dt className="font-semibold text-jaatra-gray">Available seats</dt><dd className="mt-1 text-jaatra-ink">{bus.availableSeats}</dd></div>
                <div><dt className="font-semibold text-jaatra-gray">Departure</dt><dd className="mt-1 text-jaatra-ink">{bus.departureTime}</dd></div>
                <div><dt className="font-semibold text-jaatra-gray">Arrival</dt><dd className="mt-1 text-jaatra-ink">{bus.arrivalTime}</dd></div>
                <div><dt className="font-semibold text-jaatra-gray">Driver</dt><dd className="mt-1 text-jaatra-ink">{bus.assignedDriver}</dd></div>
                <div><dt className="font-semibold text-jaatra-gray">Current location</dt><dd className="mt-1 text-jaatra-ink">{bus.currentLocation.label}</dd></div>
              </dl>
            </div>
            <div className="grid min-h-72 place-items-center rounded-2xl bg-jaatra-sky p-6 text-center ring-1 ring-sky-100">
              <div>
                <MapPinned className="mx-auto h-10 w-10 text-jaatra-teal" />
                <h2 className="mt-4 text-lg font-bold text-jaatra-ink">Live map placeholder</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-jaatra-gray">
                  GPS tracking, WebSocket updates, and map rendering will connect here in Step 6.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
