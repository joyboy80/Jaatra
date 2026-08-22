import { BusFront, Clock3, Gauge, MapPin, Navigation, TimerOff } from "lucide-react";
import LiveStatusBadge from "./LiveStatusBadge";

export default function LiveBusDetails({ bus, title = "Bus information", highlighted = false }) {
  if (!bus) return null;

  const details = [
    [MapPin, "Current location", bus.currentLocation.label],
    [Navigation, "Next stop", bus.nextStop],
    [Clock3, "ETA", `${bus.etaMinutes} min`],
    [Gauge, "Speed", `${bus.speed} km/h`],
    [TimerOff, "Delay", bus.delayMinutes ? `${bus.delayMinutes} min` : "No delay"],
  ];

  return (
    <section className={`rounded-xl border-l-4 border-cyan-500 bg-white p-5 shadow-sm ring-1 ${highlighted ? "ring-safar-amber" : "ring-slate-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-bold uppercase ${highlighted ? "text-safar-amber" : "text-safar-teal"}`}>{title}</p>
          <div className="mt-2 flex items-center gap-2"><BusFront className="h-5 w-5 text-safar-teal" /><h2 className="text-xl font-bold text-safar-ink">{bus.name}</h2></div>
          <p className="mt-1 text-sm text-safar-gray">{bus.route}</p>
        </div>
        <LiveStatusBadge status={bus.status} />
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {details.map(([Icon, label, value]) => (
          <div key={label} className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50 p-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
            <div className="min-w-0"><dt className="text-xs font-semibold text-safar-gray">{label}</dt><dd className="mt-1 break-words text-sm font-bold text-safar-ink">{value}</dd></div>
          </div>
        ))}
      </dl>
    </section>
  );
}
