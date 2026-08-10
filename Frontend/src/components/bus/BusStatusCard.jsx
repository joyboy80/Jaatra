import { Clock, MapPin, Users } from "lucide-react";
import Badge from "../common/Badge";

function toneForStatus(status) {
  if (status === "Delayed") return "danger";
  if (status === "Boarding") return "warning";
  if (status === "Arrived") return "neutral";
  return "success";
}

export default function BusStatusCard({ bus }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-jaatra-ink">{bus.name}</h3>
          <p className="text-sm text-jaatra-gray">{bus.number} / {bus.type}</p>
        </div>
        <Badge tone={toneForStatus(bus.status)}>{bus.status}</Badge>
      </div>
      <div className="mt-4 space-y-2 text-sm text-jaatra-gray">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-jaatra-teal" />
          <span className="truncate">{bus.route}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-jaatra-teal" />
          <span>{bus.departureTime} - {bus.arrivalTime} / ETA {bus.eta}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-jaatra-teal" />
          <span>{bus.availableSeats} seats available / Next: {bus.nextStop}</span>
        </div>
      </div>
    </article>
  );
}
