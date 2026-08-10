import { Clock3, MapPin, ShieldAlert, Siren } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Select from "../../components/common/Select";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { assignedBus, driverProfile, getCurrentTrip, sendEmergencyAlert } from "../../services/driverService";

export default function EmergencyPage() {
  const { setToast } = useAuth();
  const [trip, setTrip] = useState(null);
  const [type, setType] = useState("Accident");
  const [location, setLocation] = useState(assignedBus.currentLocation.label);
  const [details, setDetails] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    getCurrentTrip().then(setTrip);
  }, []);

  async function confirmEmergency() {
    await sendEmergencyAlert({
      type,
      details,
      currentLocation: location,
      tripId: trip?.id,
      busId: assignedBus.id,
      route: trip?.route,
    });
    setConfirmOpen(false);
    setDetails("");
    setToast({ type: "success", message: "Emergency alert sent to transport authority with your current trip details." });
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Emergency Operations"
          title="Emergency SOS"
          description="Use only when immediate assistance from transport authority or emergency services is needed."
        />

        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red-600 text-white"><ShieldAlert className="h-6 w-6" /></div>
            <div>
              <h2 className="font-bold text-red-900">Emergency details sent with every alert</h2>
              <div className="mt-3 grid gap-2 text-sm text-red-800 sm:grid-cols-2">
                <p>Driver: {driverProfile.name} ({driverProfile.id})</p>
                <p>Bus: {assignedBus.name} ({assignedBus.number})</p>
                <p>Route: {trip?.route || "Loading trip"}</p>
                <p className="flex items-center gap-1"><Clock3 className="h-4 w-4" /> Time recorded automatically</p>
              </div>
            </div>
          </div>
        </section>

        <form className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200" onSubmit={(event) => { event.preventDefault(); setConfirmOpen(true); }}>
          <Select label="Emergency type" value={type} onChange={(event) => setType(event.target.value)}>
            {['Accident', 'Medical Emergency', 'Bus Breakdown', 'Security Issue', 'Other'].map((item) => <option key={item}>{item}</option>)}
          </Select>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-jaatra-ink">Current location</span>
            <span className="relative block">
              <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-red-600" />
              <input className="focus-ring h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm text-jaatra-ink" required value={location} onChange={(event) => setLocation(event.target.value)} />
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-jaatra-ink">Additional details</span>
            <textarea className="focus-ring min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm text-jaatra-ink" placeholder="Briefly describe what happened and any immediate risks" value={details} onChange={(event) => setDetails(event.target.value)} />
          </label>
          <Button className="min-h-14 w-full text-base" icon={Siren} type="submit" variant="danger">Send Emergency SOS</Button>
        </form>
      </div>

      <Modal
        open={confirmOpen}
        title={`Send ${type} alert?`}
        description={`This will immediately notify transport authority about ${assignedBus.name} at ${location}.`}
        confirmLabel="Send SOS Now"
        danger
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmEmergency}
      />
    </DashboardLayout>
  );
}
