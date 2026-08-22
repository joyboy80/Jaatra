import { AlertTriangle, Clock3, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getCurrentTrip, submitDelayReport } from "../../services/driverService";

export default function DelayReportPage() {
  const { setToast } = useAuth();
  const [trip, setTrip] = useState(null);
  const [reason, setReason] = useState("Traffic");
  const [delayMinutes, setDelayMinutes] = useState("10");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCurrentTrip().then((currentTrip) => {
      setTrip(currentTrip);
      setLocation(currentTrip?.currentLocation || "");
    });
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (!trip) return;
    setSubmitting(true);
    await submitDelayReport({
      tripId: trip.id,
      busId: trip.busId,
      route: trip.route,
      reason,
      currentLocation: location,
      estimatedDelay: Number(delayMinutes),
      description,
    });
    setSubmitting(false);
    setDescription("");
    setToast({ type: "success", message: `A ${delayMinutes}-minute delay was reported to transport operations.` });
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Trip Operations"
          title="Report delay"
          description="Notify transport operations so passengers can receive an accurate trip update."
        />

        {trip && (
          <section className="grid gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100 sm:grid-cols-3">
            <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-amber-700" /><div><p className="text-xs font-semibold text-amber-700">Bus</p><p className="font-bold text-safar-ink">{trip.busName}</p></div></div>
            <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-amber-700" /><div><p className="text-xs font-semibold text-amber-700">Route</p><p className="font-bold text-safar-ink">{trip.route}</p></div></div>
            <div className="flex items-center gap-3"><Clock3 className="h-5 w-5 text-amber-700" /><div><p className="text-xs font-semibold text-amber-700">Departure</p><p className="font-bold text-safar-ink">{trip.departureTime}</p></div></div>
          </section>
        )}

        <form className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Reason" value={reason} onChange={(event) => setReason(event.target.value)}>
              {['Traffic', 'Mechanical issue', 'Weather', 'Accident', 'Other'].map((item) => <option key={item}>{item}</option>)}
            </Select>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-safar-ink">Estimated delay</span>
              <span className="flex h-11 items-center rounded-xl border border-slate-200 bg-white pr-3">
                <input className="focus-ring h-full min-w-0 flex-1 rounded-xl px-3 text-sm text-safar-ink" min="1" max="180" required type="number" value={delayMinutes} onChange={(event) => setDelayMinutes(event.target.value)} />
                <span className="text-sm font-semibold text-safar-gray">minutes</span>
              </span>
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-safar-ink">Current location</span>
            <input className="focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-safar-ink" required value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-safar-ink">Description</span>
            <textarea className="focus-ring min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm text-safar-ink" placeholder="Add details for transport operations and passengers" required value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <Button className="w-full sm:w-auto" disabled={!trip} icon={AlertTriangle} loading={submitting} type="submit">Send Delay Report</Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
