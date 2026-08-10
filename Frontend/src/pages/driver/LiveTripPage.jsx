import { CirclePause, CirclePlay, Flag, MapPin, Navigation, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import TripStatusBadge from "../../components/driver/TripStatusBadge";
import LiveBusDetails from "../../components/tracking/LiveBusDetails";
import LiveMap from "../../components/tracking/LiveMap";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import useLiveTracking from "../../hooks/useLiveTracking";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getCurrentTrip, getTripSummary, updateTripStatus } from "../../services/driverService";
import { publishDriverLocation, setLiveBusStatus } from "../../services/trackingService";

export default function LiveTripPage() {
  const { setToast } = useAuth();
  const { buses } = useLiveTracking();
  const [summary, setSummary] = useState(null);
  const [endOpen, setEndOpen] = useState(false);

  async function load() {
    const trip = await getCurrentTrip();
    setSummary(trip ? await getTripSummary(trip.id) : { trip: null, passengerCount: 0, boarded: 0, waiting: 0 });
  }

  useEffect(() => { load(); }, []);

  async function setStatus(status) {
    const updated = await updateTripStatus(summary.trip.id, status);
    setLiveBusStatus(updated.busId, status === "Completed" ? "Completed" : "Running");
    setSummary((current) => ({ ...current, trip: updated }));
    setToast({ type: "success", message: status === "Completed" ? "Trip completed and live tracking closed." : "Trip started. GPS updates are active." });
    setEndOpen(false);
  }

  const trip = summary?.trip;
  const liveBus = buses.find((bus) => bus.id === trip?.busId);

  useEffect(() => {
    if (trip?.status !== "In Progress" || !navigator.geolocation) return undefined;
    const watchId = navigator.geolocation.watchPosition((position) => {
      publishDriverLocation({
        tripId: trip.id,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: Math.max(0, (position.coords.speed || 0) * 3.6),
        locationLabel: "Live GPS position",
        nextStop: trip.nextStop,
        etaMinutes: Number.parseInt(trip.eta, 10) || 0,
        status: "Running",
        progress: 0,
      }).catch(() => undefined);
    }, () => undefined, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [trip?.eta, trip?.id, trip?.nextStop, trip?.status]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="Live Operations" title="Live trip" description="Control the current trip while GPS, ETA, location, and passenger status update in real time." actions={trip && <TripStatusBadge status={trip.status} />} />
        {trip && liveBus && <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [MapPin, "Current location", liveBus.currentLocation.label],
              [Navigation, "Next stop", liveBus.nextStop],
              [Flag, "ETA", `${liveBus.etaMinutes} min`],
              [Users, "Passengers", `${summary.boarded} / ${summary.passengerCount} boarded`],
            ].map(([Icon, label, value]) => <div key={label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><Icon className="h-5 w-5 text-jaatra-teal" /><p className="mt-3 text-xs font-bold uppercase text-jaatra-gray">{label}</p><p className="mt-1 break-words font-bold text-jaatra-ink">{value}</p></div>)}
          </section>

          <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0"><LiveMap buses={[liveBus]} selectedId={liveBus.id} highlightedId={liveBus.id} /></div>
            <LiveBusDetails bus={{ ...liveBus, route: trip.route }} title="Assigned Bus Live GPS" highlighted />
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-lg font-bold text-jaatra-ink">{trip.route}</h2><p className="mt-1 text-sm text-jaatra-gray">{trip.departureTime} - {trip.arrivalTime} | {liveBus.speed} km/h</p></div><div className="grid gap-2 sm:grid-cols-3"><Button icon={CirclePlay} disabled={trip.status === "In Progress" || trip.status === "Completed"} onClick={() => setStatus("In Progress")}>Start Trip</Button><Link className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-jaatra-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50" to="/driver/delay"><CirclePause className="h-4 w-4" /> Report Delay</Link><Button variant="danger" icon={Flag} disabled={trip.status === "Completed"} onClick={() => setEndOpen(true)}>End Trip</Button></div></div>
          </section>
        </>}
      </div>
      <Modal open={endOpen} title="Complete this trip?" description="The trip will be marked completed and its live GPS status will close." confirmLabel="Complete Trip" onClose={() => setEndOpen(false)} onConfirm={() => setStatus("Completed")} />
    </DashboardLayout>
  );
}
