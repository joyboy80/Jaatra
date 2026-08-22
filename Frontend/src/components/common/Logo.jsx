import { BusFront, MapPin, Route } from "lucide-react";

export default function Logo({ compact = false, light = false }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-safar-teal text-white shadow-glow">
        <Route className="absolute h-8 w-8 rotate-12 opacity-30" aria-hidden="true" />
        <BusFront className="h-5 w-5" aria-hidden="true" />
        <MapPin className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-cyan-400 text-white ring-2 ring-white" aria-hidden="true" />
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className={`text-xl font-extrabold leading-6 ${light ? "text-white" : "text-safar-ink"}`}>
            Safar
          </div>
          <div className={`text-xs font-medium ${light ? "text-white/75" : "text-safar-gray"}`}>
            Your Journey, Smarter.
          </div>
        </div>
      )}
    </div>
  );
}
