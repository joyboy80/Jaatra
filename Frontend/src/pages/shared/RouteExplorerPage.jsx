import {
  ArrowRight,
  Bus,
  Clock,
  Compass,
  MapPin,
  Moon,
  Navigation,
  Route,
  Sunrise,
  Sun,
  Sunset,
} from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";

/* ─── Fixed Routes Data ─── */
const FIXED_ROUTES = [
  {
    id: "r1",
    name: "Route 1 — Direct via Flyover",
    direction: "To Station",
    start: "CUET Campus",
    destination: "Station",
    stops: ["CUET Campus", "Noapara", "Rastar Matha", "Bahaddarhat", "Muradpur Flyover", "Lalkhan Bazar", "Station"],
  },
  {
    id: "r2",
    name: "Route 2 — via GEC",
    direction: "To Station",
    start: "CUET Campus",
    destination: "Station",
    stops: ["CUET Campus", "Noapara", "Rastar Matha", "Bahaddarhat", "Muradpur", "2 No. Gate", "GEC", "Wasa", "Lalkhan Bazar", "Station"],
  },
  {
    id: "r3",
    name: "Route 3 — via Flyover & GEC",
    direction: "To Station",
    start: "CUET Campus",
    destination: "Station",
    stops: ["CUET Campus", "Noapara", "Rastar Matha", "Bahaddarhat", "Muradpur Flyover", "GEC", "Wasa", "Lalkhan Bazar", "Station"],
  },
  {
    id: "r4",
    name: "Route 4 — Return via Bahaddarhat",
    direction: "To CUET",
    start: "Station",
    destination: "CUET",
    stops: ["Station", "Lalkhan Bazar", "Flyover", "Bahaddarhat", "Rastar Matha", "Noapara", "CUET"],
  },
  {
    id: "r5",
    name: "Route 5 — Return via GEC",
    direction: "To CUET",
    start: "Station",
    destination: "CUET Campus",
    stops: ["Station", "Lalkhan Bazar", "Wasa", "GEC", "2 No. Gate", "Muradpur", "Bahaddarhat", "Rastar Matha", "Noapara", "CUET Campus"],
  },
];

/* ─── Fixed Schedule Data ─── */
const SCHEDULE_GROUPS = [
  {
    id: "morning",
    label: "Morning",
    note: "Sun – Fri",
    icon: Sunrise,
    color: "from-amber-400 to-orange-500",
    textColor: "text-amber-700 dark:text-amber-300",
    borderColor: "border-l-amber-400",
    schedules: [
      { from: "CUET Campus", to: "Station", depart: "5:45 AM", arrive: "7:00 AM", icon: "🚌" },
      { from: "Station", to: "CUET Campus", depart: "7:10 AM", arrive: "8:30 AM", icon: "🚌" },
    ],
  },
  {
    id: "noon",
    label: "Noon",
    note: "Sun – Fri",
    icon: Sun,
    color: "from-sky-400 to-blue-500",
    textColor: "text-sky-700 dark:text-sky-300",
    borderColor: "border-l-sky-400",
    schedules: [
      { from: "CUET Campus", to: "Rastar Matha", depart: "1:30 PM", arrive: "2:20 PM", icon: "🚌" },
      { from: "Rastar Matha", to: "CUET Campus", depart: "2:20 PM", arrive: "3:10 PM", icon: "🚌" },
    ],
  },
  {
    id: "afternoon",
    label: "Afternoon",
    note: "Sun – Fri",
    icon: Sunset,
    color: "from-orange-400 to-rose-500",
    textColor: "text-orange-700 dark:text-orange-300",
    borderColor: "border-l-orange-400",
    schedules: [
      { from: "CUET Campus", to: "Station", depart: "4:15 PM", arrive: "6:00 PM", icon: "🚌" },
    ],
  },
  {
    id: "night",
    label: "Night",
    note: "Sun – Fri",
    icon: Moon,
    color: "from-indigo-400 to-violet-600",
    textColor: "text-indigo-700 dark:text-indigo-300",
    borderColor: "border-l-indigo-500",
    schedules: [
      { from: "Station", to: "CUET Campus", depart: "8:45 PM", arrive: "10:30 PM", icon: "🌙" },
    ],
  },
  {
    id: "saturday-afternoon",
    label: "Saturday — Afternoon",
    note: "Saturday only",
    icon: Sunset,
    color: "from-rose-400 to-pink-600",
    textColor: "text-rose-700 dark:text-rose-300",
    borderColor: "border-l-rose-500",
    schedules: [
      { from: "CUET Campus", to: "Station", depart: "2:30 PM", arrive: "4:00 PM", icon: "🚌" },
    ],
  },
  {
    id: "saturday-night",
    label: "Saturday — Night",
    note: "Saturday only",
    icon: Moon,
    color: "from-purple-500 to-violet-700",
    textColor: "text-purple-700 dark:text-purple-300",
    borderColor: "border-l-purple-500",
    schedules: [
      { from: "Station", to: "CUET Campus", depart: "8:15 PM", arrive: "10:00 PM", icon: "🌙" },
    ],
  },
];

/* ─── Route Card Component ─── */
function RouteCard({ route }) {
  const isToStation = route.direction === "To Station";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-teal-50/40 p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-safar-teal/30 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/20">
      {/* Decorative gradient blob */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-safar-teal/10 to-emerald-400/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:from-safar-teal/20" />

      {/* Header */}
      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm bg-gradient-to-br ${isToStation ? "from-safar-teal to-emerald-500" : "from-safar-navy to-blue-600"}`}>
            <Route className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-safar-ink dark:text-white truncate">
              {route.name}
            </h3>
            <p className="text-[11px] font-medium text-safar-gray dark:text-slate-400">
              {route.start} → {route.destination}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${isToStation ? "bg-safar-teal/10 text-safar-teal dark:bg-teal-900/30 dark:text-teal-300" : "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300"}`}>
          <Navigation className="h-2.5 w-2.5" />
          {route.direction}
        </span>
      </div>

      {/* Timeline Stop Sequence */}
      <div className="relative mt-4 pl-3">
        <div className={`absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b ${isToStation ? "from-safar-teal via-emerald-300 to-safar-teal/30" : "from-safar-navy via-blue-400 to-safar-navy/30"} dark:opacity-70`} />
        <div className="flex flex-col gap-1">
          {route.stops.map((stop, i) => {
            const isFirst = i === 0;
            const isLast = i === route.stops.length - 1;
            return (
              <div key={stop} className="relative flex items-center gap-2.5 py-0.5">
                <div
                  className={`relative z-10 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${
                    isFirst
                      ? isToStation ? "border-safar-teal bg-safar-teal" : "border-safar-navy bg-safar-navy"
                      : isLast
                        ? isToStation ? "border-emerald-500 bg-emerald-500" : "border-blue-500 bg-blue-500"
                        : isToStation ? "border-safar-teal/50 bg-white dark:bg-slate-900" : "border-blue-400/50 bg-white dark:bg-slate-900"
                  }`}
                >
                  {(isFirst || isLast) && (
                    <span className="h-1 w-1 rounded-full bg-white" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    isFirst || isLast
                      ? "text-safar-ink dark:text-white font-bold"
                      : "text-safar-gray dark:text-slate-400"
                  }`}
                >
                  {stop}
                </span>
                {isFirst && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-safar-gray/60 dark:text-slate-500">Start</span>
                )}
                {isLast && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-safar-gray/60 dark:text-slate-500">End</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stop count */}
      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-safar-gray dark:text-slate-400">
        <MapPin className="h-3 w-3 text-safar-teal" />
        {route.stops.length} stops
      </div>
    </div>
  );
}

/* ─── Schedule Flashcard Component ─── */
function ScheduleFlashcard({ schedule, group }) {
  return (
    <div className={`rounded-xl border-l-[3px] ${group.borderColor} bg-white px-3 py-2 shadow-xs ring-1 ring-slate-200/80 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-slate-900 dark:ring-slate-800`}>
      <div className="flex items-center gap-2.5">
        <span className="text-base leading-none">{schedule.icon}</span>
        <div className="flex flex-1 items-center gap-1.5 min-w-0">
          <span className="text-[12px] font-bold text-safar-ink dark:text-white truncate">
            {schedule.from}
          </span>
          <ArrowRight className={`h-3 w-3 shrink-0 ${group.textColor}`} />
          <span className="text-[12px] font-bold text-safar-ink dark:text-white truncate">
            {schedule.to}
          </span>
        </div>
      </div>
      {(schedule.depart || schedule.arrive) && (
        <div className="mt-1.5 flex items-center gap-3 pl-7 text-[10px] font-semibold text-safar-gray dark:text-slate-400">
          {schedule.depart && (
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 text-safar-teal" />
              Depart {schedule.depart}
            </span>
          )}
          {schedule.arrive && (
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 text-emerald-500" />
              Arrive {schedule.arrive}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function RouteExplorerPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Route Explorer"
          title="CUET Transit Routes"
          description="Fixed bus routes between CUET Campus and Station with all stoppage details."
        />

        {/* ─── Fixed Routes Section ─── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-safar-teal to-emerald-500 shadow-sm">
                <Compass className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-safar-ink dark:text-white">
                  Bus Routes
                </h2>
                <p className="text-[11px] text-safar-gray dark:text-slate-400">
                  CUET ↔ Station fixed transit routes
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-safar-teal/10 to-emerald-100/60 px-3 py-1 text-[11px] font-bold text-safar-teal ring-1 ring-safar-teal/20 dark:from-teal-900/30 dark:to-teal-900/10 dark:text-teal-300 dark:ring-teal-800/40">
              <Route className="h-3 w-3" />
              {FIXED_ROUTES.length} Routes
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {FIXED_ROUTES.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        </section>

        {/* ─── Bus Schedule Flashcards Section ─── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-safar-ink dark:text-white">
                  Daily Bus Schedule
                </h2>
                <p className="text-[11px] text-safar-gray dark:text-slate-400">
                  Fixed schedule — Morning, Noon, Afternoon &amp; Night
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-100/60 to-indigo-100/60 px-3 py-1 text-[11px] font-bold text-violet-600 ring-1 ring-violet-200/40 dark:from-violet-950/30 dark:to-indigo-950/30 dark:text-violet-300 dark:ring-violet-800/40">
              <Bus className="h-3 w-3" />
              Fixed Schedule
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {SCHEDULE_GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Group header with gradient */}
                  <div className={`flex items-center gap-2.5 bg-gradient-to-r ${group.color} px-4 py-2.5`}>
                    <Icon className="h-4 w-4 text-white" />
                    <span className="text-sm font-extrabold text-white">
                      {group.label}
                    </span>
                    {group.note && (
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-semibold text-white/90 backdrop-blur-sm">
                        {group.note}
                      </span>
                    )}
                    <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                      {group.schedules.length} {group.schedules.length === 1 ? "trip" : "trips"}
                    </span>
                  </div>

                  {/* Schedule flashcards */}
                  <div className="flex flex-col gap-2 p-3">
                    {group.schedules.map((schedule, i) => (
                      <ScheduleFlashcard
                        key={`${group.id}-${i}`}
                        schedule={schedule}
                        group={group}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

