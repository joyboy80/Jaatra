import { BusFront, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import AdminFormModal from "../../components/admin/AdminFormModal";
import Button from "../../components/common/Button";
import ErrorState from "../../components/common/ErrorState";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { deleteRoute, getAdminBuses, getAdminRoutes, saveRoute } from "../../services/adminService";

const blankRoute = { name: "", start: "", destination: "", stops: [], assignedBusIds: [], estimatedMinutes: 45 };

export default function RouteManagementPage() {
  const { setToast } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [form, setForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [routeData, busData] = await Promise.all([getAdminRoutes(), getAdminBuses()]);
      setRoutes(routeData);
      setBuses(busData);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    const stops = form.stopsText.split("\n").map((stop) => stop.trim()).filter(Boolean);
    await saveRoute({ ...form, stops, start: stops[0] || form.start, destination: stops[stops.length - 1] || form.destination });
    setForm(null);
    setToast({ type: "success", message: "Route network updated." });
    await load();
  }

  async function confirmDelete() {
    await deleteRoute(deleteTarget.id);
    setDeleteTarget(null);
    setToast({ type: "info", message: "Route removed from the network." });
    await load();
  }

  function openForm(route = blankRoute) {
    setForm({ ...route, assignedBusIds: [...(route.assignedBusIds || [])], stopsText: (route.stops || []).join("\n") });
  }

  function toggleBus(id) {
    setForm((current) => ({ ...current, assignedBusIds: current.assignedBusIds.includes(id) ? current.assignedBusIds.filter((item) => item !== id) : [...current.assignedBusIds, id] }));
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="Network Management" title="Routes" description="Create campus routes, arrange stops, and assign fleet coverage." actions={<Button icon={Plus} onClick={() => openForm()}>Add Route</Button>} />
        {error && <ErrorState title="Routes unavailable" message={error} />}
        <section className="grid gap-4 xl:grid-cols-2">
          {routes.map((route) => (
            <article key={route.id} className="min-w-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-bold uppercase text-safar-teal">{route.id}</p><h2 className="mt-1 text-lg font-bold text-safar-ink">{route.name}</h2><p className="mt-1 text-sm text-safar-gray">{route.start} to {route.destination} | {route.estimatedMinutes} min</p></div>
                <div className="flex gap-1"><button className="focus-ring rounded-lg p-2 text-safar-teal hover:bg-safar-mint" aria-label={`Edit ${route.name}`} onClick={() => openForm(route)}><Pencil className="h-4 w-4" /></button><button className="focus-ring rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${route.name}`} onClick={() => setDeleteTarget(route)}><Trash2 className="h-4 w-4" /></button></div>
              </div>
              <div className="mt-5 overflow-x-auto pb-2">
                <div className="flex min-w-max items-start">
                  {route.stops.map((stop, index) => (
                    <div key={`${stop}-${index}`} className="flex items-start">
                      <div className="w-28 text-center"><div className={`mx-auto grid h-8 w-8 place-items-center rounded-full ${index === 0 || index === route.stops.length - 1 ? "bg-safar-teal text-white" : "bg-safar-sky text-safar-teal"}`}><MapPin className="h-4 w-4" /></div><p className="mt-2 text-xs font-semibold text-safar-ink">{stop}</p></div>
                      {index < route.stops.length - 1 && <div className="mt-4 h-0.5 w-8 bg-safar-teal/40" />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-safar-gray"><BusFront className="h-4 w-4 text-safar-teal" /> {route.assignedBusIds.length} buses assigned</div>
            </article>
          ))}
        </section>
      </div>

      <AdminFormModal open={Boolean(form)} title={form?.id ? `Edit ${form.name}` : "Add route"} onClose={() => setForm(null)} onSubmit={submit} submitLabel={form?.id ? "Update Route" : "Add Route"}>
        {form && <>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-semibold">Route name</span><input className="focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="block"><span className="mb-2 block text-sm font-semibold">Estimated travel time</span><span className="flex items-center rounded-xl border border-slate-200 pr-3"><input className="focus-ring h-11 min-w-0 flex-1 rounded-xl px-3 text-sm" min="5" type="number" value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })} /><span className="text-sm text-safar-gray">min</span></span></label></div>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Bus stops</span><textarea className="focus-ring min-h-36 w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder={'One stop per line\nMain Campus\nCentral Library\nNorth Hall'} required value={form.stopsText} onChange={(e) => setForm({ ...form, stopsText: e.target.value })} /><span className="mt-1 block text-xs text-safar-gray">First and last entries become the start and destination. Remove a line to remove a stop.</span></label>
          <fieldset><legend className="text-sm font-semibold">Assign buses</legend><div className="mt-2 grid max-h-48 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3 sm:grid-cols-2">{buses.map((bus) => <label key={bus.id} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-2 hover:bg-slate-50"><input className="h-4 w-4 accent-safar-teal" type="checkbox" checked={form.assignedBusIds.includes(bus.id)} onChange={() => toggleBus(bus.id)} /><span className="text-sm font-medium text-safar-ink">{bus.name} <span className="text-safar-gray">({bus.number})</span></span></label>)}</div></fieldset>
        </>}
      </AdminFormModal>
      <Modal open={Boolean(deleteTarget)} title={`Delete ${deleteTarget?.name}?`} description="Assigned buses will remain in the fleet but this route definition will be removed." confirmLabel="Delete Route" danger onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </DashboardLayout>
  );
}
