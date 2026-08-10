import { useEffect, useState } from "react";
import DriverTripCard from "../../components/driver/DriverTripCard";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getAssignedTrips, getTripSummary } from "../../services/driverService";

export default function DriverTripsPage() {
  const [trips, setTrips] = useState([]);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    async function load() {
      const assignedTrips = await getAssignedTrips();
      const summaries = await Promise.all(assignedTrips.map((trip) => getTripSummary(trip.id)));
      setTrips(assignedTrips);
      setCounts(Object.fromEntries(summaries.map((summary) => [summary.trip.id, summary.passengerCount])));
    }

    load();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Operations"
          title="Today's trips"
          description="Review every trip assigned to you and open the active trip workspace."
        />
        <section className="grid gap-4 xl:grid-cols-2">
          {trips.map((trip) => (
            <DriverTripCard key={trip.id} trip={trip} passengerCount={counts[trip.id] || 0} />
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}
