import { BusFront, CalendarCheck, Clock, Ticket, Users } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import PortalBusCard from "../../components/bus/PortalBusCard";
import Badge from "../../components/common/Badge";
import { useAuth } from "../../context/AuthContext";
import { getBusesForRole, getRoleBusLabel } from "../../utils/busAccess";

const roleDashboardCopy = {
  student: {
    eyebrow: "Student Portal",
    title: "Good Morning, Mahbubur",
    description: "Ready for your journey today?",
    listTitle: "Today's Bus List",
    firstStat: "Today's Reservations",
  },
  teacher: {
    eyebrow: "Teacher Portal",
    title: "Teacher dashboard",
    description: "Today's teacher buses, reservations, active ticket, seat availability, and schedule.",
    listTitle: "Today's Teacher Buses",
    firstStat: "Upcoming Reservation",
  },
  staff: {
    eyebrow: "Staff Portal",
    title: "Staff dashboard",
    description: "Today's staff buses, reservations, active ticket, seat availability, and schedule.",
    listTitle: "Today's Staff Buses",
    firstStat: "Upcoming Reservation",
  },
};

export default function PortalDashboard({ role }) {
  const { user } = useAuth();
  const buses = getBusesForRole(role);
  const upcomingBus = buses[0];
  const totalSeats = buses.reduce((sum, bus) => sum + bus.availableSeats, 0);
  const copy = roleDashboardCopy[role];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow={copy.eyebrow}
          title={role === "student" ? `${copy.title} ${String.fromCodePoint(0x1f44b)}` : copy.title}
          description={copy.description}
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={CalendarCheck} label={copy.firstStat} value={role === "student" ? "1" : "1"} helper={upcomingBus?.departureTime} />
          <StatCard icon={Clock} label="Upcoming Trip" value={upcomingBus?.name || "None"} helper={upcomingBus?.route} />
          <StatCard icon={BusFront} label="Available Buses" value={buses.length} helper={getRoleBusLabel(role)} />
          <StatCard icon={Ticket} label="Active Ticket" value={role === "student" ? "Ready" : "Confirmed"} helper={upcomingBus?.id} />
        </section>

        {role !== "student" && (
          <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-jaatra-ink">Available Seats</h2>
                  <p className="mt-1 text-sm text-jaatra-gray">Only {getRoleBusLabel(role).toLowerCase()} are shown by default.</p>
                </div>
                <Badge tone="success">{totalSeats} seats</Badge>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-jaatra-mint">
                  <Users className="h-5 w-5 text-jaatra-teal" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-jaatra-ink">Bus Schedule</h2>
                  <p className="mt-1 text-sm text-jaatra-gray">Next departure: {upcomingBus?.departureTime || "No schedule"}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-jaatra-ink">{copy.listTitle}</h2>
              <p className="text-sm text-jaatra-gray">
                Showing transportation available to {user?.roleLabel || "this role"} only.
              </p>
            </div>
            <Badge tone="info">{buses.length} operating today</Badge>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {buses.map((bus) => (
              <PortalBusCard key={bus.id} bus={bus} role={role} />
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
