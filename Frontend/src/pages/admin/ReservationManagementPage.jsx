import { useEffect, useMemo, useState } from "react";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import ResponsiveDataList from "../../components/admin/ResponsiveDataList";
import Select from "../../components/common/Select";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getAdminReservations } from "../../services/adminService";

export default function ReservationManagementPage() {
  const [reservations, setReservations] = useState([]);
  const [filters, setFilters] = useState({ date: "", bus: "All", route: "All", role: "All", status: "All" });
  useEffect(() => { getAdminReservations().then(setReservations); }, []);

  const options = (key) => ["All", ...new Set(reservations.map((item) => item[key]).filter(Boolean))];
  const visible = useMemo(() => reservations.filter((item) =>
    (!filters.date || item.date === filters.date) &&
    (filters.bus === "All" || item.busName === filters.bus) &&
    (filters.route === "All" || item.route === filters.route) &&
    (filters.role === "All" || item.roleLabel === filters.role) &&
    (filters.status === "All" || item.status === filters.status)
  ), [filters, reservations]);
  const setFilter = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.value }));
  const columns = [
    { label: "Booking", render: (item) => <span className="break-all text-xs font-bold text-jaatra-ink">{item.bookingId}</span> },
    { label: "Passenger", render: (item) => <div><p className="font-bold text-jaatra-ink">{item.passengerName}</p><p className="text-xs text-jaatra-gray">{item.universityId} | {item.roleLabel}</p></div> },
    { label: "Trip", render: (item) => <div><p className="font-semibold text-jaatra-ink">{item.busName}</p><p className="text-xs text-jaatra-gray">{item.route}</p></div> },
    { label: "Date & Time", render: (item) => <span className="text-jaatra-gray">{item.date}<br />{item.departureTime}</span> },
    { label: "Seat", render: (item) => <span className="font-bold text-jaatra-ink">{item.seatNumber}</span> },
    { label: "Reservation", render: (item) => <AdminStatusBadge status={item.status} /> },
    { label: "Boarding", render: (item) => <AdminStatusBadge status={item.boardingStatus} /> },
  ];

  return <DashboardLayout><div className="space-y-6"><PageHeader eyebrow="Passenger Operations" title="Reservations" description="Audit booking and boarding status across every bus, route, and user type." />
    <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2 xl:grid-cols-5">
      <label><span className="mb-2 block text-sm font-semibold">Date</span><input className="focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" type="date" value={filters.date} onChange={setFilter("date")} /></label>
      <Select label="Bus" value={filters.bus} onChange={setFilter("bus")}>{options("busName").map((item) => <option key={item}>{item}</option>)}</Select>
      <Select label="Route" value={filters.route} onChange={setFilter("route")}>{options("route").map((item) => <option key={item}>{item}</option>)}</Select>
      <Select label="User type" value={filters.role} onChange={setFilter("role")}>{options("roleLabel").map((item) => <option key={item}>{item}</option>)}</Select>
      <Select label="Status" value={filters.status} onChange={setFilter("status")}>{options("status").map((item) => <option key={item}>{item}</option>)}</Select>
    </section>
    <p className="text-sm font-semibold text-jaatra-gray">Showing {visible.length} of {reservations.length} reservations</p>
    <ResponsiveDataList columns={columns} rows={visible} rowKey="bookingId" renderMobile={(item) => <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-jaatra-ink">{item.passengerName}</h2><p className="text-xs text-jaatra-gray">{item.universityId} | {item.roleLabel}</p></div><span className="text-lg font-bold">{item.seatNumber}</span></div><p className="mt-3 text-sm font-semibold">{item.busName} | {item.route}</p><p className="mt-1 text-xs text-jaatra-gray">{item.date} at {item.departureTime}</p><div className="mt-3 flex flex-wrap gap-2"><AdminStatusBadge status={item.status} /><AdminStatusBadge status={item.boardingStatus} /></div><p className="mt-3 break-all text-xs font-semibold text-jaatra-gray">{item.bookingId}</p></article>} />
  </div></DashboardLayout>;
}
