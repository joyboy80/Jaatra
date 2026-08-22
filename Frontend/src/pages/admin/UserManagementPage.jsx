import { Eye, Search, UserCheck, UserX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import ResponsiveDataList from "../../components/admin/ResponsiveDataList";
import Select from "../../components/common/Select";
import ErrorState from "../../components/common/ErrorState";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getAdminUsers, updateUser } from "../../services/adminService";

const roles = ["Student", "Teacher", "Staff", "Driver"];

export default function UserManagementPage() {
  const { setToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  async function load() { try { setUsers(await getAdminUsers()); setError(""); } catch (requestError) { setError(requestError.message); } }
  useEffect(() => { load(); }, []);
  const visible = useMemo(() => { const needle = query.toLowerCase(); return users.filter((user) => (role === "All" || user.role === role) && [user.name, user.universityId, user.email].some((value) => value.toLowerCase().includes(needle))); }, [query, role, users]);
  async function changeUser(id, updates, message) { await updateUser(id, updates); setToast({ type: "success", message }); await load(); }
  const controls = (user) => <div className="flex flex-wrap items-center gap-2"><select aria-label={`Role for ${user.name}`} title="Verified identity roles cannot be changed here" disabled className="focus-ring h-9 rounded-lg border border-slate-200 px-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60" value={user.role}>{roles.map((item) => <option key={item}>{item}</option>)}</select><button className="focus-ring rounded-lg p-2 text-safar-teal hover:bg-safar-mint" aria-label={`View ${user.name}`} onClick={() => setToast({ type: "info", message: `${user.name}: ${user.universityId}, ${user.email}.` })}><Eye className="h-4 w-4" /></button><button className={`focus-ring rounded-lg p-2 ${user.status === "Active" ? "text-red-600 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`} aria-label={`${user.status === "Active" ? "Deactivate" : "Activate"} ${user.name}`} onClick={() => changeUser(user.id, { status: user.status === "Active" ? "Inactive" : "Active" }, `${user.name} is now ${user.status === "Active" ? "inactive" : "active"}.`)}>{user.status === "Active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}</button></div>;
  const columns = [
    { label: "User", render: (user) => <div><p className="font-bold text-safar-ink">{user.name}</p><p className="text-xs text-safar-gray">{user.email}</p></div> },
    { label: "University ID", render: (user) => <span className="font-semibold text-safar-ink">{user.universityId}</span> },
    { label: "Role", render: (user) => <span className="text-safar-gray">{user.role}</span> },
    { label: "Status", render: (user) => <AdminStatusBadge status={user.status} /> },
    { label: "Actions", render: controls },
  ];
  return <DashboardLayout><div className="space-y-6"><PageHeader eyebrow="Access Management" title="Users" description="Search university users and control account access." />{error ? <ErrorState title="Users unavailable" message={error} /> : <><section className="grid gap-3 sm:grid-cols-[1fr_220px]"><label className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-safar-gray" /><input className="focus-ring h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm" placeholder="Search name, ID, or email" value={query} onChange={(e) => setQuery(e.target.value)} /></label><Select value={role} onChange={(e) => setRole(e.target.value)}><option>All</option>{roles.map((item) => <option key={item}>{item}</option>)}</Select></section><ResponsiveDataList columns={columns} rows={visible} renderMobile={(user) => <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-safar-ink">{user.name}</h2><p className="text-xs text-safar-gray">{user.universityId}</p></div><AdminStatusBadge status={user.status} /></div><p className="mt-3 text-sm text-safar-gray">{user.email}</p><div className="mt-4">{controls(user)}</div></article>} /></>}</div></DashboardLayout>;
}
