import { BusFront, Clock, MapPinned, Navigation, Ticket, Users } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Badge from "../../components/common/Badge";
import StatCard from "../../components/common/StatCard";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getBusByRole } from "../../services/busService";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";

export default function BusDetailsPage({ role }) {
  const { id } = useParams();
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    getBusByRole(role, id).then(setBus).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [id, role]);

  if (loading) return <DashboardLayout><Loading label="Loading bus details" /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState title="Bus details unavailable" message={error} /></DashboardLayout>;

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
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-safar-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-safar-navy"
                to={`/${role}/reservations/new?busId=${encodeURIComponent(bus.id)}`}
              >
                <Ticket className="h-4 w-4" />
                Reserve Seat
              </Link>
              <Link
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-safar-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
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
              <h2 className="text-lg font-bold text-safar-ink">Route stops</h2>
              <Badge tone="info">{bus.stops.length} stops</Badge>
            </div>
            <ol className="mt-5 space-y-4">
              {bus.stops.map((stop, index) => (
                <li key={stop} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-safar-mint text-sm font-bold text-safar-teal">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-safar-ink">{stop}</p>
                    <p className="text-sm text-safar-gray">{index === 0 ? "Starting point" : index === bus.stops.length - 1 ? "Destination" : "Intermediate stop"}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-bold text-safar-ink">Trip information</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="font-semibold text-safar-gray">Category</dt><dd className="mt-1 text-safar-ink">{bus.type}</dd></div>
                <div><dt className="font-semibold text-safar-gray">Available seats</dt><dd className="mt-1 text-safar-ink">{bus.availableSeats}</dd></div>
                <div><dt className="font-semibold text-safar-gray">Departure</dt><dd className="mt-1 text-safar-ink">{bus.departureTime}</dd></div>
                <div><dt className="font-semibold text-safar-gray">Arrival</dt><dd className="mt-1 text-safar-ink">{bus.arrivalTime}</dd></div>
                <div><dt className="font-semibold text-safar-gray">Driver</dt><dd className="mt-1 text-safar-ink">{bus.assignedDriver}</dd></div>
                <div><dt className="font-semibold text-safar-gray">Current location</dt><dd className="mt-1 text-safar-ink">{bus.currentLocation.label}</dd></div>
              </dl>
            </div>
            <div className="grid min-h-72 place-items-center rounded-2xl bg-safar-sky p-6 text-center ring-1 ring-sky-100">
              <div>
                <MapPinned className="mx-auto h-10 w-10 text-safar-teal" />
                <h2 className="mt-4 text-lg font-bold text-safar-ink">Feature currently unavailable</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-safar-gray">
                  This detail view does not currently provide an embedded backend map. Use Track Bus for reported positions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
