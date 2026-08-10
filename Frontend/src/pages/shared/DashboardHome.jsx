import { Bot, BusFront, MapPinned, ShieldCheck, Ticket, Users } from "lucide-react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import PageHeader from "../../components/layout/PageHeader";
import BusStatusCard from "../../components/bus/BusStatusCard";
import BusTable from "../../components/bus/BusTable";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useEffect, useMemo, useState } from "react";
import { getBuses, getBusesByRole } from "../../services/busService";

const roleCopy = {
  student: {
    eyebrow: "Student Portal",
    title: "Student dashboard",
    description: "Reserve seats, follow live buses, and keep today's commute organized from one place.",
  },
  teacher: {
    eyebrow: "Faculty Transport",
    title: "Teacher dashboard",
    description: "View faculty routes, scheduled buses, and travel notifications for teaching days.",
  },
  staff: {
    eyebrow: "Staff Transport",
    title: "Staff dashboard",
    description: "Track staff buses, commute timings, and reservation readiness for university operations.",
  },
  driver: {
    eyebrow: "Driver Console",
    title: "Driver dashboard",
    description: "Start with today's trips, passenger counts, QR checks, and live route readiness.",
  },
  admin: {
    eyebrow: "Transport Authority",
    title: "Admin dashboard",
    description: "Monitor buses, users, schedules, reservations, analytics, and future AI insights.",
  },
};

function StatCard({ icon: Icon, label, value, tone = "text-jaatra-teal" }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-jaatra-sky">
          <Icon className={`h-5 w-5 ${tone}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-jaatra-gray">{label}</p>
          <p className="text-2xl font-bold text-jaatra-ink">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardHome({ role }) {
  const copy = roleCopy[role];
  const [buses, setBuses] = useState([]);
  useEffect(() => {
    (role === "admin" ? getBuses() : getBusesByRole(role)).then(setBuses);
  }, [role]);
  const visibleBuses = buses.slice(0, role === "admin" ? buses.length : 6);
  const busStats = useMemo(() => ({
    total: buses.length,
    active: buses.filter((bus) => !["Arrived", "Offline", "Under Maintenance"].includes(bus.status)).length,
    availableSeats: buses.reduce((sum, bus) => sum + Number(bus.availableSeats || 0), 0),
    delayed: buses.filter((bus) => bus.status === "Delayed").length,
  }), [buses]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          actions={
            <>
              <Button icon={MapPinned}>Live Tracking</Button>
              <Button variant="secondary" icon={Bot}>Jaatra AI</Button>
            </>
          }
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={BusFront} label="University buses" value={busStats.total} />
          <StatCard icon={MapPinned} label="Active now" value={busStats.active} />
          <StatCard icon={Ticket} label="Seats available" value={busStats.availableSeats} />
          <StatCard icon={ShieldCheck} label="Delayed" value={busStats.delayed} tone="text-jaatra-amber" />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-jaatra-ink">Smart commute snapshot</h2>
                <p className="mt-1 text-sm text-jaatra-gray">A future-ready surface for GPS, reservations, AI routing, and QR validation.</p>
              </div>
              <Badge tone="info">Step 1 foundation</Badge>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-jaatra-sky p-4">
                <MapPinned className="h-6 w-6 text-jaatra-teal" />
                <h3 className="mt-4 font-bold text-jaatra-ink">Live map ready</h3>
                <p className="mt-1 text-sm text-jaatra-gray">Tracking APIs and WebSockets can attach here later.</p>
              </div>
              <div className="rounded-2xl bg-jaatra-mint p-4">
                <Users className="h-6 w-6 text-jaatra-teal" />
                <h3 className="mt-4 font-bold text-jaatra-ink">Role aware</h3>
                <p className="mt-1 text-sm text-jaatra-gray">Students, teachers, staff, drivers, and authority users are separated.</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <Bot className="h-6 w-6 text-jaatra-amber" />
                <h3 className="mt-4 font-bold text-jaatra-ink">AI extensible</h3>
                <p className="mt-1 text-sm text-jaatra-gray">The AI service placeholder is ready for route intelligence.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-jaatra-navy p-5 text-white shadow-soft">
            <p className="text-sm font-semibold text-white/70">Next departure</p>
            <h2 className="mt-2 text-2xl font-bold">{buses[0].name}</h2>
            <p className="mt-2 text-sm text-white/75">{buses[0].route}</p>
            <div className="mt-5 rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-white/70">Leaves at</p>
              <p className="text-3xl font-bold">{buses[0].departureTime}</p>
              <p className="mt-2 text-sm text-white/75">Next stop: {buses[0].nextStop} / ETA {buses[0].eta}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-jaatra-ink">Today's buses</h2>
              <p className="text-sm text-jaatra-gray">Responsive cards for mobile, table overview for wider screens.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleBuses.slice(0, 6).map((bus) => (
              <BusStatusCard key={bus.id} bus={bus} />
            ))}
          </div>
        </section>

        <section className="hidden lg:block">
          <BusTable buses={visibleBuses} />
        </section>
      </div>
    </DashboardLayout>
  );
}
