import { BusFront, Clock, Eye, MapPin, Navigation, Ticket, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../common/Badge";
import { getBusAccent } from "../../utils/busIdentity";

function toneForStatus(status) {
  if (status === "Delayed") return "danger";
  if (status === "Boarding") return "warning";
  if (status === "Arrived") return "neutral";
  return "success";
}

export default function PortalBusCard({ bus, role }) {
  return (
    <article className={`bus-card ${getBusAccent(bus.name)}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bus-icon grid h-11 w-11 shrink-0 place-items-center rounded-lg"><BusFront className="h-5 w-5" /></div>
          <div className="min-w-0"><h3 className="text-lg font-extrabold text-jaatra-ink">{bus.name}</h3>
          <p className="mt-1 text-sm text-jaatra-gray">{bus.type}</p>
          </div>
        </div>
        <Badge tone={toneForStatus(bus.status)}>{bus.status}</Badge>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-jaatra-gray sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <MapPin className="bus-color h-4 w-4 shrink-0" />
          <span className="min-w-0 truncate">{bus.route}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="bus-color h-4 w-4 shrink-0" />
          <span>{bus.departureTime} - {bus.arrivalTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="bus-color h-4 w-4 shrink-0" />
          <span>{bus.availableSeats} seats available</span>
        </div>
        <div className="flex items-center gap-2">
          <Navigation className="bus-color h-4 w-4 shrink-0" />
          <span>Next: {bus.nextStop} / ETA {bus.eta}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <Link
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-jaatra-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          to={`/${role}/buses/${bus.id}`}
        >
          <Eye className="h-4 w-4" />
          View Details
        </Link>
        <Link
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-jaatra-teal px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-jaatra-navy"
          to={`/${role}/reservations/new?busId=${encodeURIComponent(bus.id)}`}
        >
          <Ticket className="h-4 w-4" />
          Reserve Seat
        </Link>
        <Link
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
          to={`/${role}/tracking`}
        >
          <Navigation className="h-4 w-4" />
          Track
        </Link>
      </div>
    </article>
  );
}
