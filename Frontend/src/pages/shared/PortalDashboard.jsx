import { BusFront, CalendarCheck, Clock, Ticket, Users } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import PortalBusCard from "../../components/bus/PortalBusCard";
import Badge from "../../components/common/Badge";
import DashboardBusCarousel from "../../components/common/DashboardBusCarousel";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { useAuth } from "../../context/AuthContext";
import { getRoleBusLabel } from "../../utils/busAccess";
import { getBusesByRole } from "../../services/busService";
import { getReservations } from "../../services/reservationService";
import { getTickets } from "../../services/ticketService";
import { useEffect, useState } from "react";

const roleDashboardCopy = {
  student: {
    eyebrow: "Student Portal",
    title: "Student dashboard",
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
  const [buses, setBuses] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([getBusesByRole(role), getReservations(user.id), getTickets(user.id)])
      .then(([busData, reservationData, ticketData]) => {
        setBuses(busData);
        setReservations(reservationData);
        setTickets(ticketData);
      })
      .catch((requestError) => setError(requestError.message));
  }, [role, user.id]);
  const activeReservations = reservations.filter((item) => item.status === "Confirmed");
  const activeTickets = tickets.filter((item) => item.status === "Confirmed");
  const upcomingReservation = activeReservations[0];
  const upcomingBus = buses.find((item) => item.id === upcomingReservation?.busId) || buses[0];
  const totalSeats = buses.reduce((sum, bus) => sum + bus.availableSeats, 0);
  const copy = roleDashboardCopy[role];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow={copy.eyebrow}
          title={`${copy.title}: ${user.name}`}
          description={copy.description}
        />

        <DashboardBusCarousel />

        {error && <ErrorState title="Dashboard unavailable" message={error} />}

        {!error && <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={CalendarCheck} label={copy.firstStat} value={activeReservations.length} helper={upcomingReservation?.departureTime || "No upcoming reservation"} />
          <StatCard icon={Clock} label="Upcoming Trip" value={upcomingBus?.name || "None"} helper={upcomingBus?.route} />
          <StatCard icon={BusFront} label="Available Buses" value={buses.length} helper={getRoleBusLabel(role)} />
          <StatCard icon={Ticket} label="Active Tickets" value={activeTickets.length} helper={activeTickets[0]?.ticketId || "No active ticket"} />
        </section>}

        {!error && role !== "student" && (
          <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-safar-ink">Available Seats</h2>
                  <p className="mt-1 text-sm text-safar-gray">Only {getRoleBusLabel(role).toLowerCase()} are shown by default.</p>
                </div>
                <Badge tone="success">{totalSeats} seats</Badge>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-safar-mint">
                  <Users className="h-5 w-5 text-safar-teal" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-safar-ink">Bus Schedule</h2>
                  <p className="mt-1 text-sm text-safar-gray">Next departure: {upcomingBus?.departureTime || "No schedule"}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {!error && <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-safar-ink">{copy.listTitle}</h2>
              <p className="text-sm text-safar-gray">
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
          {!buses.length && <EmptyState title="No buses available" message="The backend returned no buses for this role." />}
        </section>}
      </div>
    </DashboardLayout>
  );
}
