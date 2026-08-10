import { Search, UserCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Badge from "../../components/common/Badge";
import Select from "../../components/common/Select";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getAssignedTrips, getCurrentTrip, getPassengerManifest } from "../../services/driverService";

function boardingTone(status) {
  if (status === "Boarded") return "success";
  if (status === "Cancelled") return "danger";
  return "warning";
}

function PassengerStatus({ passenger }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge tone={passenger.status === "Cancelled" ? "danger" : passenger.status === "Used" ? "neutral" : "info"}>
        {passenger.status === "Used" ? "Scanned" : passenger.status}
      </Badge>
      <Badge tone={boardingTone(passenger.boardingStatus)}>{passenger.boardingStatus}</Badge>
    </div>
  );
}

export default function PassengerListPage() {
  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState("");
  const [passengers, setPassengers] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    async function loadTrips() {
      const [assignedTrips, currentTrip] = await Promise.all([getAssignedTrips(), getCurrentTrip()]);
      setTrips(assignedTrips);
      setTripId(currentTrip.id);
    }

    loadTrips();
  }, []);

  useEffect(() => {
    if (!tripId) return;
    getPassengerManifest(tripId).then(setPassengers);
  }, [tripId]);

  const visiblePassengers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return passengers.filter((passenger) => {
      const matchesQuery =
        !needle ||
        passenger.passengerName.toLowerCase().includes(needle) ||
        passenger.universityId.toLowerCase().includes(needle) ||
        passenger.seatNumber.toLowerCase().includes(needle);
      return matchesQuery && (status === "All" || passenger.boardingStatus === status);
    });
  }, [passengers, query, status]);

  const boarded = passengers.filter((passenger) => passenger.boardingStatus === "Boarded").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Passenger Management"
          title="Passenger list"
          description={`${boarded} of ${passengers.filter((item) => item.boardingStatus !== "Cancelled").length} passengers boarded.`}
        />

        <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:grid-cols-[1fr_1.4fr_0.8fr]">
          <Select label="Trip" value={tripId} onChange={(event) => setTripId(event.target.value)}>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>{trip.departureTime} - {trip.route}</option>
            ))}
          </Select>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-jaatra-ink">Search passenger or student ID</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-jaatra-gray" />
              <input
                className="focus-ring h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-jaatra-ink"
                placeholder="Name, university ID, or seat"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </span>
          </label>
          <Select label="Boarding status" value={status} onChange={(event) => setStatus(event.target.value)}>
            {['All', 'Boarded', 'Not Boarded', 'Cancelled'].map((option) => <option key={option}>{option}</option>)}
          </Select>
        </section>

        <section className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-jaatra-gray">
                <tr>
                  <th className="px-4 py-3">Passenger</th>
                  <th className="px-4 py-3">University ID</th>
                  <th className="px-4 py-3">User type</th>
                  <th className="px-4 py-3">Seat</th>
                  <th className="px-4 py-3">Ticket / Boarding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visiblePassengers.map((passenger) => (
                  <tr key={passenger.ticketId}>
                    <td className="px-4 py-4 font-semibold text-jaatra-ink">{passenger.passengerName}</td>
                    <td className="px-4 py-4 text-jaatra-gray">{passenger.universityId}</td>
                    <td className="px-4 py-4 text-jaatra-gray">{passenger.roleLabel}</td>
                    <td className="px-4 py-4 font-bold text-jaatra-ink">{passenger.seatNumber}</td>
                    <td className="px-4 py-4"><PassengerStatus passenger={passenger} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-3 md:hidden">
          {visiblePassengers.map((passenger) => (
            <article key={passenger.ticketId} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-jaatra-sky">
                    {passenger.boardingStatus === "Boarded" ? <UserCheck className="h-5 w-5 text-jaatra-teal" /> : <Users className="h-5 w-5 text-jaatra-gray" />}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-bold text-jaatra-ink">{passenger.passengerName}</h2>
                    <p className="text-sm text-jaatra-gray">{passenger.universityId} | {passenger.roleLabel}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-jaatra-ink">{passenger.seatNumber}</span>
              </div>
              <div className="mt-4"><PassengerStatus passenger={passenger} /></div>
            </article>
          ))}
        </section>

        {visiblePassengers.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center text-sm font-semibold text-jaatra-gray shadow-sm ring-1 ring-slate-200">
            No passengers match this search and status filter.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
