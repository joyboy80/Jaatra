import { History, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import ResponsiveDataList from "../../components/admin/ResponsiveDataList";
import ErrorState from "../../components/common/ErrorState";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getAdminDrivers, updateDriver } from "../../services/adminService";

const statuses = ["Available", "On Trip", "Off Duty", "Emergency"];

export default function DriverManagementPage() {
  const { setToast } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState("");
  async function load() { try { setDrivers(await getAdminDrivers()); setError(""); } catch (requestError) { setError(requestError.message); } }
  useEffect(() => { load(); }, []);
  async function setStatus(driver, status) { await updateDriver(driver.id, { status }); setToast({ type: "success", message: `${driver.name} is now ${status}.` }); await load(); }
  const actions = (driver) => <div className="flex flex-wrap gap-2"><select aria-label={`Status for ${driver.name}`} className="focus-ring h-9 rounded-lg border border-slate-200 px-2 text-xs font-semibold" value={driver.status} onChange={(e) => setStatus(driver, e.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select><button className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold text-safar-teal hover:bg-safar-mint" onClick={() => setToast({ type: "info", message: `${driver.name} completed ${driver.completedTrips} trips this term.` })}><History className="h-4 w-4" /> History</button></div>;
  const columns = [
    { label: "Driver", render: (driver) => <div><p className="font-bold text-safar-ink">{driver.name}</p><p className="text-xs text-safar-gray">{driver.id}</p></div> },
    { label: "Assigned Bus", render: (driver) => <span className="font-semibold text-safar-ink">{driver.assignedBus}</span> },
    { label: "Contact", render: (driver) => <span className="text-safar-gray">{driver.contact}</span> },
    { label: "Status", render: (driver) => <AdminStatusBadge status={driver.status} /> },
    { label: "Trip History", render: (driver) => <span className="font-bold text-safar-ink">{driver.completedTrips} trips</span> },
    { label: "Actions", render: actions },
  ];
  return <DashboardLayout><div className="space-y-6"><PageHeader eyebrow="Workforce Operations" title="Drivers" description="Monitor assignments, availability, contact details, and trip history." />{error ? <ErrorState title="Drivers unavailable" message={error} /> : <ResponsiveDataList columns={columns} rows={drivers} renderMobile={(driver) => <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-safar-ink">{driver.name}</h2><p className="text-xs text-safar-gray">{driver.id}</p></div><AdminStatusBadge status={driver.status} /></div><p className="mt-3 text-sm font-semibold text-safar-ink">Assigned: {driver.assignedBus}</p><p className="mt-2 flex items-center gap-2 text-sm text-safar-gray"><Phone className="h-4 w-4" />{driver.contact}</p><div className="mt-4">{actions(driver)}</div></article>} />}</div></DashboardLayout>;
}
