import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import AdminFormModal from "../../components/admin/AdminFormModal";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import ResponsiveDataList from "../../components/admin/ResponsiveDataList";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Select from "../../components/common/Select";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { deleteSchedule, getAdminBuses, getAdminSchedules, saveSchedule, scheduleTypes } from "../../services/adminService";
import { toDateInputValue } from "../../utils/date";

const blankSchedule = { busId: "", busName: "", route: "", date: toDateInputValue(new Date()), departureTime: "07:30 AM", arrivalTime: "08:20 AM", busCategory: "Student Bus", scheduleType: "Regular", status: "Scheduled" };

export default function ScheduleManagementPage() {
  const { setToast } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [form, setForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() { const [scheduleData, busData] = await Promise.all([getAdminSchedules(), getAdminBuses()]); setSchedules(scheduleData); setBuses(busData); }
  useEffect(() => { load(); }, []);

  function chooseBus(busId) {
    const bus = buses.find((item) => item.id === busId);
    setForm((current) => ({ ...current, busId, busName: bus?.name || "", route: bus?.route || current.route, busCategory: bus?.type || current.busCategory }));
  }

  async function submit(event) { event.preventDefault(); await saveSchedule(form); setForm(null); setToast({ type: "success", message: "Schedule saved and published to operations." }); await load(); }
  async function confirmDelete() { await deleteSchedule(deleteTarget.id); setDeleteTarget(null); setToast({ type: "info", message: "Schedule removed." }); await load(); }
  const actions = (schedule) => <div className="flex gap-1"><button className="focus-ring rounded-lg p-2 text-jaatra-teal hover:bg-jaatra-mint" aria-label={`Edit schedule ${schedule.id}`} onClick={() => setForm({ ...schedule })}><Pencil className="h-4 w-4" /></button><button className="focus-ring rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Delete schedule ${schedule.id}`} onClick={() => setDeleteTarget(schedule)}><Trash2 className="h-4 w-4" /></button></div>;
  const columns = [
    { label: "Bus", render: (item) => <div><p className="font-bold text-jaatra-ink">{item.busName}</p><p className="text-xs text-jaatra-gray">{item.busCategory}</p></div> },
    { label: "Route", render: (item) => <span className="text-jaatra-gray">{item.route}</span> },
    { label: "Date", render: (item) => <span className="font-medium text-jaatra-ink">{item.date}</span> },
    { label: "Time", render: (item) => <span className="text-jaatra-gray">{item.departureTime} - {item.arrivalTime}</span> },
    { label: "Type", render: (item) => <span className="font-medium text-jaatra-gray">{item.scheduleType}</span> },
    { label: "Status", render: (item) => <AdminStatusBadge status={item.status} /> },
    { label: "Actions", render: actions },
  ];

  return <DashboardLayout><div className="space-y-6"><PageHeader eyebrow="Service Planning" title="Schedules" description="Publish regular, weekend, holiday, exam, and special event trips." actions={<Button icon={Plus} onClick={() => setForm({ ...blankSchedule, busId: buses[0]?.id || "", busName: buses[0]?.name || "", route: buses[0]?.route || "", busCategory: buses[0]?.type || "Student Bus" })}>Add Schedule</Button>} /><ResponsiveDataList columns={columns} rows={schedules} renderMobile={(item) => <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-jaatra-ink">{item.busName}</h2><p className="mt-1 text-sm text-jaatra-gray">{item.route}</p></div><AdminStatusBadge status={item.status} /></div><div className="mt-3 grid grid-cols-2 gap-2 text-sm"><span>{item.date}</span><span>{item.scheduleType}</span><span>{item.departureTime}</span><span>{item.arrivalTime}</span></div><div className="mt-3">{actions(item)}</div></article>} /></div>
    <AdminFormModal open={Boolean(form)} title={form?.id ? "Edit schedule" : "Add schedule"} onClose={() => setForm(null)} onSubmit={submit} submitLabel="Save Schedule">{form && <><div className="grid gap-4 sm:grid-cols-2"><Select label="Bus" value={form.busId} onChange={(e) => chooseBus(e.target.value)}>{buses.map((bus) => <option key={bus.id} value={bus.id}>{bus.name} ({bus.number})</option>)}</Select><Select label="Schedule type" value={form.scheduleType} onChange={(e) => setForm({ ...form, scheduleType: e.target.value })}>{scheduleTypes.map((type) => <option key={type}>{type}</option>)}</Select></div><label className="block"><span className="mb-2 block text-sm font-semibold">Route</span><input className="focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" required value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} /></label><div className="grid gap-4 sm:grid-cols-3"><label><span className="mb-2 block text-sm font-semibold">Date</span><input className="focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label><span className="mb-2 block text-sm font-semibold">Departure</span><input className="focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" required value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} /></label><label><span className="mb-2 block text-sm font-semibold">Arrival</span><input className="focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" required value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} /></label></div><Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['Scheduled', 'Boarding', 'In Progress', 'Delayed', 'Completed', 'Cancelled'].map((status) => <option key={status}>{status}</option>)}</Select></>}</AdminFormModal>
    <Modal open={Boolean(deleteTarget)} title="Delete this schedule?" description={`${deleteTarget?.busName || "This bus"} will no longer operate this scheduled trip.`} confirmLabel="Delete Schedule" danger onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
  </DashboardLayout>;
}
