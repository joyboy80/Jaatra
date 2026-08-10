import { BusFront, LocateFixed } from "lucide-react";
import LiveStatusBadge from "./LiveStatusBadge";

function markerPosition(bus, index) {
  const lat = bus.currentLocation?.lat ?? 23.75 + index * 0.004;
  const lng = bus.currentLocation?.lng ?? 90.39 + index * 0.003;
  const x = 8 + Math.max(0, Math.min(1, (lng - 90.375) / 0.07)) * 82;
  const y = 8 + (1 - Math.max(0, Math.min(1, (lat - 23.735) / 0.09))) * 78;
  return { left: `${x}%`, top: `${y}%` };
}

const markerColors = {
  Delayed: "bg-red-600",
  Maintenance: "bg-amber-500",
  Offline: "bg-slate-500",
  Completed: "bg-slate-400",
  Running: "bg-jaatra-teal",
  "On Time": "bg-emerald-600",
};

export default function LiveMap({ buses, selectedId, highlightedId, onSelect, className = "" }) {
  const selected = buses.find((bus) => bus.id === selectedId);

  return (
    <div className={`live-map relative isolate min-h-[320px] w-full overflow-hidden rounded-xl bg-slate-100 shadow-sm ring-1 ring-slate-200 sm:min-h-[440px] ${className}`}>
      <div className="map-grid absolute inset-0 opacity-60" />
      <div className="absolute -left-[8%] top-[55%] h-2 w-[116%] -rotate-6 rounded-full bg-white shadow-sm" />
      <div className="absolute left-[22%] top-[-8%] h-[116%] w-2 rotate-12 rounded-full bg-white shadow-sm" />
      <div className="absolute right-[-10%] top-[22%] h-2 w-[92%] rotate-[24deg] rounded-full bg-white shadow-sm" />
      <div className="absolute bottom-[18%] left-[8%] h-2 w-[62%] rotate-[18deg] rounded-full bg-white shadow-sm" />

      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-jaatra-ink shadow-sm ring-1 ring-cyan-500/15">
        <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" /></span>
        Live GPS simulation
      </div>

      {buses.map((bus, index) => {
        const selectedMarker = bus.id === selectedId;
        const highlighted = bus.id === highlightedId;
        return (
          <button
            key={bus.id}
            type="button"
            className={`focus-ring absolute z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white shadow-soft ring-4 transition duration-500 ${markerColors[bus.status] || "bg-jaatra-teal"} ${
              highlighted ? "ring-jaatra-amber" : selectedMarker ? "scale-110 ring-jaatra-navy" : "ring-white hover:scale-105"
            }`}
            style={markerPosition(bus, index)}
            onClick={() => onSelect?.(bus.id)}
            aria-label={`Select ${bus.name}, ${bus.status}`}
            title={`${bus.name} - ${bus.status}`}
          >
            <BusFront className="h-5 w-5" />
            {highlighted && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-jaatra-amber ring-2 ring-white" />}
          </button>
        );
      })}

      {selected && (
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 rounded-lg bg-white/95 p-3 shadow-soft ring-1 ring-cyan-500/15 sm:left-auto sm:w-72">
          <div className="min-w-0"><p className="truncate font-bold text-jaatra-ink">{selected.name}</p><p className="truncate text-xs text-jaatra-gray">{selected.currentLocation.label}</p></div>
          <LiveStatusBadge status={selected.status} />
        </div>
      )}

      <div className="absolute right-3 top-3 z-10 hidden items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-jaatra-gray ring-1 ring-cyan-500/15 sm:flex">
        <LocateFixed className="h-4 w-4 text-cyan-600" /> {buses.length} buses
      </div>
    </div>
  );
}
