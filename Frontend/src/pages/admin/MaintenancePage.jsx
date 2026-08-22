import { CalendarClock, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import ResponsiveDataList from "../../components/admin/ResponsiveDataList";
import ErrorState from "../../components/common/ErrorState";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getMaintenanceRecords, updateMaintenance } from "../../services/adminService";

const statuses = ["Good", "Minor Issue", "Critical", "Under Maintenance"];

export default function MaintenancePage() {
  const { setToast } = useAuth();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  async function load() { try { setRecords(await getMaintenanceRecords()); setError(""); } catch (requestError) { setError(requestError.message); } }
  useEffect(() => { load(); }, []);
  async function changeStatus(record, status) { await updateMaintenance(record.id, { status, condition: status }); setToast({ type: "success", message: `${record.busName} maintenance status updated.` }); await load(); }
  const statusControl = (record) => <select aria-label={`Maintenance status for ${record.busName}`} className="focus-ring h-9 rounded-lg border border-slate-200 px-2 text-xs font-semibold" value={record.status} onChange={(e) => changeStatus(record, e.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select>;
  const columns = [
    { label: "Bus", render: (record) => <div><p className="font-bold text-safar-ink">{record.busName}</p><p className="text-xs text-safar-gray">{record.busId}</p></div> },
    { label: "Condition", render: (record) => <AdminStatusBadge status={record.condition} /> },
    { label: "Last Maintenance", render: (record) => <span className="text-safar-gray">{record.lastMaintenance}</span> },
    { label: "Next Maintenance", render: (record) => <span className="font-semibold text-safar-ink">{record.nextMaintenance}</span> },
    { label: "Reported Issue", render: (record) => <span className="text-safar-gray">{record.reportedIssue}</span> },
    { label: "Status", render: statusControl },
  ];
  return <DashboardLayout><div className="space-y-6"><PageHeader eyebrow="Fleet Health" title="Maintenance" description="Track reported conditions, open issues, and preventive maintenance dates." />{error ? <ErrorState title="Maintenance unavailable" message={error} /> : <ResponsiveDataList columns={columns} rows={records} renderMobile={(record) => <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><Wrench className="h-5 w-5 text-safar-teal" /><h2 className="font-bold text-safar-ink">{record.busName}</h2></div><AdminStatusBadge status={record.condition} /></div><p className="mt-3 text-sm text-safar-gray">{record.reportedIssue}</p><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-safar-gray"><span>Last: {record.lastMaintenance}</span><span>Next: {record.nextMaintenance}</span></div><div className="mt-4 flex items-center gap-2"><CalendarClock className="h-4 w-4 text-safar-teal" />{statusControl(record)}</div></article>} />}</div></DashboardLayout>;
}
