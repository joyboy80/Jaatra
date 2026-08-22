import { Eye, MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminFormModal from "../../components/admin/AdminFormModal";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import ResponsiveDataList from "../../components/admin/ResponsiveDataList";
import Button from "../../components/common/Button";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import Select from "../../components/common/Select";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { deleteBus, getAdminBuses, saveBus } from "../../services/adminService";

const blankBus = { name: "", number: "", type: "Student Bus", capacity: 44, route: "", assignedDriver: "", status: "On Time" };

export default function BusManagementPage() {
  const { setToast } = useAuth();
  const [buses, setBuses] = useState([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() { setLoading(true); try { setBuses(await getAdminBuses()); setError(""); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    const needle = query.toLowerCase();
    return buses.filter((bus) => [bus.name, bus.number, bus.type, bus.route, bus.assignedDriver].some((value) => value?.toLowerCase().includes(needle)));
  }, [buses, query]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveBus(form);
      setToast({ type: "success", message: form.id ? "Bus details updated." : "New bus added to the fleet." });
      setForm(null);
      await load();
    } catch (requestError) { setError(requestError.message); setToast({ type: "error", message: requestError.message }); } finally { setSaving(false); }
  }

  async function confirmDelete() {
    try { await deleteBus(deleteTarget.id); setDeleteTarget(null); setToast({ type: "info", message: "Bus removed from the admin fleet list." }); await load(); }
    catch (requestError) { setError(requestError.message); setToast({ type: "error", message: requestError.message }); setDeleteTarget(null); }
  }

  const actions = (bus) => (
    <div className="flex flex-wrap gap-2">
      <button className="focus-ring rounded-lg p-2 text-safar-teal hover:bg-safar-mint hover:text-safar-navy" aria-label={`Edit ${bus.name}`} onClick={() => setForm({ ...bus })}><Pencil className="h-4 w-4" /></button>
      <button className="focus-ring rounded-lg p-2 text-safar-gray hover:bg-slate-100 hover:text-safar-ink" aria-label={`View condition for ${bus.name}`} onClick={() => setToast({ type: "info", message: `${bus.name}: ${bus.status}, ${bus.availableSeats} seats available.` })}><Eye className="h-4 w-4" /></button>
      <button className="focus-ring rounded-lg p-2 text-safar-gray hover:bg-slate-100 hover:text-safar-ink" aria-label={`View location for ${bus.name}`} onClick={() => setToast({ type: "info", message: bus.currentLocation?.label ? `${bus.name} is at ${bus.currentLocation.label}.` : "No backend-reported location is available." })}><MapPin className="h-4 w-4" /></button>
      <button className="focus-ring rounded-lg p-2 text-red-600 hover:bg-red-50 hover:text-red-700" aria-label={`Delete ${bus.name}`} onClick={() => setDeleteTarget(bus)}><Trash2 className="h-4 w-4" /></button>
    </div>
  );

  const columns = [
    { label: "Bus", render: (bus) => <div><p className="font-bold text-safar-ink">{bus.name}</p><p className="text-xs text-safar-gray">{bus.id} | {bus.number}</p></div> },
    { label: "Category", render: (bus) => <span className="font-medium text-safar-gray">{bus.type}</span> },
    { label: "Capacity", render: (bus) => <span className="font-bold text-safar-ink">{bus.capacity}</span> },
    { label: "Route", render: (bus) => <span className="text-safar-gray">{bus.route}</span> },
    { label: "Driver", render: (bus) => <span className="text-safar-gray">{bus.assignedDriver}</span> },
    { label: "Status", render: (bus) => <AdminStatusBadge status={bus.status} /> },
    { label: "Actions", render: actions },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="Fleet Management" title="Buses" description="Manage fleet records, assignments, categories, capacity, condition, and current status." actions={<Button icon={Plus} onClick={() => setForm({ ...blankBus })}>Add Bus</Button>} />
        {error && <ErrorState title="Fleet unavailable" message={error} />}
        <label className="relative block max-w-xl"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-safar-gray" /><input className="focus-ring h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm" placeholder="Search bus, route, driver, or category" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        {loading ? <Loading label="Loading fleet buses" /> : visible.length ? <ResponsiveDataList columns={columns} rows={visible} renderMobile={(bus) => (
          <article className="rounded-2xl bg-white p-4 text-safar-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-safar-mint/70 hover:text-safar-ink">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-safar-ink">{bus.name} <span className="text-sm font-medium text-safar-gray">{bus.number}</span></h2><p className="mt-1 text-sm text-safar-gray">{bus.type} | {bus.capacity} seats</p></div><AdminStatusBadge status={bus.status} /></div>
            <p className="mt-3 text-sm font-medium text-safar-ink">{bus.route}</p><p className="mt-1 text-xs text-safar-gray">Driver: {bus.assignedDriver}</p><div className="mt-4">{actions(bus)}</div>
          </article>
        )} /> : <EmptyState title={buses.length ? "No buses match your search" : "No buses in the fleet"} message={buses.length ? "Try another bus name, number, route, driver, or category." : "Add a bus to make it available for daily assignments."} />}
      </div>

      <AdminFormModal open={Boolean(form)} title={form?.id ? `Edit ${form.name}` : "Add bus"} onClose={() => setForm(null)} onSubmit={submit} submitLabel={form?.id ? "Update Bus" : "Add Bus"} loading={saving}>
        {form && <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-semibold">Bus name</span><input className="focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold">Bus number</span><input className="focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></label>
            <Select label="Category" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{['Student Bus', 'Female Student Bus', 'Teacher Bus', 'Staff Bus'].map((item) => <option key={item}>{item}</option>)}</Select>
            <label className="block"><span className="mb-2 block text-sm font-semibold">Capacity</span><input className="focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" min="10" required type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></label>
          </div>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Route</span><input className="focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="Main Campus - North Hall" required value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} /></label>
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['On Time', 'Boarding', 'En Route', 'Delayed', 'Arrived', 'Under Maintenance'].map((item) => <option key={item}>{item}</option>)}</Select>
          <p className="rounded-xl bg-safar-mint px-3 py-2 text-sm text-safar-ink">Assign this fleet bus to a Driver from Daily bus assignments using the Driver’s registered email.</p>
        </>}
      </AdminFormModal>
      <Modal open={Boolean(deleteTarget)} title={`Delete ${deleteTarget?.name}?`} description="This permanently removes the bus through the backend. Existing reservation history remains governed by backend constraints." confirmLabel="Delete Bus" danger onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </DashboardLayout>
  );
}
