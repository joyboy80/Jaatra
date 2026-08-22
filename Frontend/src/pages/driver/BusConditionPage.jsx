import { AlertTriangle, Camera, CheckCircle2, Upload, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getCurrentTrip, submitConditionReport } from "../../services/driverService";

const conditionOptions = [
  { value: "Good", icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { value: "Minor Issue", icon: Wrench, className: "border-amber-200 bg-amber-50 text-amber-700" },
  { value: "Critical Issue", icon: AlertTriangle, className: "border-red-200 bg-red-50 text-red-700" },
];

export default function BusConditionPage() {
  const { setToast } = useAuth();
  const [trip, setTrip] = useState(null);
  const [condition, setCondition] = useState("Good");
  const [category, setCategory] = useState("Engine");
  const [description, setDescription] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCurrentTrip().then(setTrip);
  }, []);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    await submitConditionReport({
      busId: trip.busId,
      tripId: trip?.id,
      condition,
      category,
      description: description.trim() || "Routine condition check completed.",
      photoName,
    });
    setSubmitting(false);
    setDescription("");
    setPhotoName("");
    setToast({ type: "success", message: "Bus condition report submitted to transport operations." });
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Vehicle Operations"
          title="Bus condition"
          description={trip ? `Report the current condition of ${trip.busName} (${trip.busNumber}).` : "No assigned trip is currently available."}
        />

        <form className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200" onSubmit={submit}>
          <fieldset>
            <legend className="text-sm font-bold text-safar-ink">Overall condition</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {conditionOptions.map((option) => (
                <button
                  key={option.value}
                  className={`focus-ring flex min-h-20 items-center justify-center gap-3 rounded-xl border-2 px-4 text-sm font-bold transition ${
                    condition === option.value ? option.className : "border-slate-200 bg-white text-safar-gray hover:bg-slate-50"
                  }`}
                  onClick={() => setCondition(option.value)}
                  type="button"
                >
                  <option.icon className="h-5 w-5" />
                  {option.value}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 lg:grid-cols-2">
            <Select label="Issue category" value={category} onChange={(event) => setCategory(event.target.value)}>
              {['Engine', 'Brake', 'Tyre', 'AC', 'Electrical', 'Other'].map((item) => <option key={item}>{item}</option>)}
            </Select>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-safar-ink">Photo</span>
              <span className="focus-within:focus-ring flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 px-3 text-sm font-medium text-safar-gray">
                <Camera className="h-4 w-4 text-safar-teal" />
                <span className="min-w-0 flex-1 truncate">{photoName || "Choose an issue photo"}</span>
                <Upload className="h-4 w-4" />
                <input className="sr-only" type="file" accept="image/*" onChange={(event) => setPhotoName(event.target.files?.[0]?.name || "")} />
              </span>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-safar-ink">Issue description</span>
            <textarea
              className="focus-ring min-h-32 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm text-safar-ink"
              placeholder="Describe symptoms, location of damage, or checks completed"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <Button className="w-full sm:w-auto" disabled={!trip} loading={submitting} type="submit">Submit Report</Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
