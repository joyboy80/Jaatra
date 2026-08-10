import { AlertTriangle, BusFront, CirclePlay, Gauge, QrCode, Siren, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import StatCard from "../../components/common/StatCard";
import TripStatusBadge from "../../components/driver/TripStatusBadge";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { assignedBus, driverProfile, getCurrentTrip, getTripSummary, updateTripStatus } from "../../services/driverService";

const actions = [
  { label: "Passenger List", path: "/driver/passengers", icon: Users },
  { label: "QR Scanner", path: "/driver/scanner", icon: QrCode },
  { label: "Bus Condition", path: "/driver/bus-condition", icon: Gauge },
  { label: "Report Delay", path: "/driver/delay", icon: AlertTriangle },
  { label: "Emergency SOS", path: "/driver/emergency", icon: Siren, danger: true },
];

export default function DriverDashboard() {
  const { setToast } = useAuth();
  const [summary, setSummary] = useState(null);

  async function loadDashboard() {
    const trip = await getCurrentTrip();
    setSummary(trip ? await getTripSummary(trip.id) : { trip: null, passengerCount: 0, boarded: 0, waiting: 0, capacity: 0 });
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function startTrip() {
    await updateTripStatus(summary.trip.id, "In Progress");
    setToast({ type: "success", message: "Trip started. Live trip status is now active." });
    await loadDashboard();
  }

  const trip = summary?.trip;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Driver Portal"
          title={`Welcome, ${driverProfile.name}`}
          description={`${driverProfile.id} | Assigned to ${assignedBus.name} (${assignedBus.number})`}
          actions={<Badge tone="success">Ready for duty</Badge>}
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={BusFront} label="Assigned Bus" value={assignedBus.name} helper={assignedBus.type} />
          <StatCard icon={Users} label="Passengers" value={`${summary?.passengerCount || 0} / ${assignedBus.capacity}`} helper="Current manifest" />
          <StatCard icon={UserCheck} label="Boarded" value={summary?.boarded || 0} helper="Verified passengers" />
          <StatCard icon={Users} label="Waiting" value={summary?.waiting || 0} helper="Not yet boarded" tone="text-jaatra-amber" />
        </section>

        {trip && (
          <section className="rounded-xl border-l-4 border-jaatra-teal bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold uppercase tracking-wide text-jaatra-teal">Today's Trip</p>
                  <TripStatusBadge status={trip.status} />
                </div>
                <h2 className="mt-2 text-xl font-bold text-jaatra-ink">{trip.route}</h2>
                <p className="mt-2 text-sm text-jaatra-gray">
                  {trip.departureTime} - {trip.arrivalTime} | {assignedBus.type}
                </p>
              </div>
              <Button className="w-full lg:w-auto" icon={CirclePlay} disabled={trip.status === "In Progress"} onClick={startTrip}>
                {trip.status === "In Progress" ? "Trip In Progress" : "Start Trip"}
              </Button>
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-lg font-bold text-jaatra-ink">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {actions.map((action) => (
              <Link
                key={action.label}
                className={`focus-ring flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl p-4 text-center text-sm font-extrabold shadow-sm ring-1 transition active:scale-[0.98] ${
                  action.danger
                    ? "bg-red-50 text-red-700 ring-red-100 hover:bg-red-100"
                    : "bg-white text-jaatra-ink ring-slate-200 hover:bg-jaatra-mint hover:text-jaatra-navy hover:ring-jaatra-teal/30"
                }`}
                to={action.path}
              >
                <span className={`grid h-12 w-12 place-items-center rounded-lg ${action.danger ? "bg-red-100" : "bg-jaatra-mint text-jaatra-teal"}`}><action.icon className="h-6 w-6" /></span>
                {action.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
