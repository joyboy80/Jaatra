import { ArrowRight, BusFront, CalendarDays, Clock3, Users } from "lucide-react";
import { Link } from "react-router-dom";
import TripStatusBadge from "./TripStatusBadge";

export default function DriverTripCard({ trip, passengerCount = 0 }) {
  return (
    <article className="rounded-xl border-l-4 border-jaatra-teal bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BusFront className="h-5 w-5 text-jaatra-teal" />
            <h2 className="text-lg font-bold text-jaatra-ink">{trip.busName}</h2>
          </div>
          <p className="mt-1 text-sm font-medium text-jaatra-gray">{trip.route}</p>
        </div>
        <TripStatusBadge status={trip.status} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <CalendarDays className="h-4 w-4 text-jaatra-teal" />
          <p className="mt-2 font-semibold text-jaatra-ink">{trip.date}</p>
          <p className="text-xs text-jaatra-gray">Date</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <Clock3 className="h-4 w-4 text-jaatra-teal" />
          <p className="mt-2 font-semibold text-jaatra-ink">{trip.departureTime}</p>
          <p className="text-xs text-jaatra-gray">Departure</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <Clock3 className="h-4 w-4 text-jaatra-teal" />
          <p className="mt-2 font-semibold text-jaatra-ink">{trip.arrivalTime}</p>
          <p className="text-xs text-jaatra-gray">Arrival</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <Users className="h-4 w-4 text-jaatra-teal" />
          <p className="mt-2 font-semibold text-jaatra-ink">{passengerCount}</p>
          <p className="text-xs text-jaatra-gray">Passengers</p>
        </div>
      </div>
      <Link
        className="focus-ring mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-jaatra-ink ring-1 ring-slate-200 transition hover:bg-jaatra-mint sm:w-auto"
        to="/driver/live-trip"
      >
        Open Trip <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
