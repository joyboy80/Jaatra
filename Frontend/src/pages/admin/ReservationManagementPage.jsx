import { Check, Copy, Pencil, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminFormModal from "../../components/admin/AdminFormModal";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import ResponsiveDataList from "../../components/admin/ResponsiveDataList";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Loading from "../../components/common/Loading";
import Select from "../../components/common/Select";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getAdminBuses,
  getAdminReservations,
  getAdminRoutes,
  updateAdminReservation,
} from "../../services/adminService";

const initialFilters = {
  date: "",
  bus: "All",
  route: "All",
  role: "All",
  status: "All",
  boardingStatus: "All",
};

const reservationStatuses = ["Confirmed", "Used", "Cancelled", "Expired"];
const boardingStatuses = ["Not Boarded", "Boarded", "Cancelled"];
const userRoles = ["Student", "Teacher", "Staff"];

export default function ReservationManagementPage() {
  const { setToast } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: "Confirmed", boardingStatus: "Not Boarded" });
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [resData, busesData, routesData] = await Promise.all([
        getAdminReservations(),
        getAdminBuses().catch(() => []),
        getAdminRoutes().catch(() => []),
      ]);
      setReservations(resData || []);
      setBuses(busesData || []);
      setRoutes(routesData || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filterBusOptions = useMemo(() => {
    const list = new Set();
    buses.forEach((b) => b.name && list.add(b.name));
    reservations.forEach((r) => r.busName && list.add(r.busName));
    return ["All", ...Array.from(list).sort()];
  }, [buses, reservations]);

  const filterRouteOptions = useMemo(() => {
    const list = new Set();
    routes.forEach((r) => r.name && list.add(r.name));
    reservations.forEach((r) => r.route && list.add(r.route));
    return ["All", ...Array.from(list).sort()];
  }, [routes, reservations]);

  const filterRoleOptions = useMemo(() => {
    const list = new Set(userRoles);
    reservations.forEach((r) => r.roleLabel && list.add(r.roleLabel));
    return ["All", ...Array.from(list).sort()];
  }, [reservations]);

  const filterStatusOptions = useMemo(() => {
    const list = new Set(reservationStatuses);
    reservations.forEach((r) => r.status && list.add(r.status));
    return ["All", ...Array.from(list)];
  }, [reservations]);

  const filterBoardingOptions = useMemo(() => {
    const list = new Set(boardingStatuses);
    reservations.forEach((r) => r.boardingStatus && list.add(r.boardingStatus));
    return ["All", ...Array.from(list)];
  }, [reservations]);

  const visible = useMemo(
    () =>
      reservations.filter(
        (item) =>
          (!filters.date || item.date === filters.date) &&
          (filters.bus === "All" || item.busName === filters.bus) &&
          (filters.route === "All" || item.route === filters.route) &&
          (filters.role === "All" || item.roleLabel === filters.role) &&
          (filters.status === "All" || item.status === filters.status) &&
          (filters.boardingStatus === "All" || item.boardingStatus === filters.boardingStatus)
      ),
    [filters, reservations]
  );

  const setFilter = (key) => (event) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }));

  function resetFilters() {
    setFilters(initialFilters);
  }

  function handleOpenEdit(item) {
    setEditing(item);
    setForm({
      status: item.status || "Confirmed",
      boardingStatus: item.boardingStatus || "Not Boarded",
    });
  }

  async function handleUpdateSubmit(e) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await updateAdminReservation(editing.bookingId, form);
      setToast({
        type: "success",
        message: `Reservation ${editing.bookingId} updated successfully.`,
      });
      setEditing(null);
      await loadData();
    } catch (updateError) {
      setToast({ type: "error", message: updateError.message });
    } finally {
      setSaving(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setToast({ type: "info", message: `Booking ID ${text} copied to clipboard.` });
    setTimeout(() => setCopiedId(""), 2500);
  }

  const columns = [
    {
      label: "Booking ID",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-safar-ink">{item.bookingId}</span>
          <button
            type="button"
            className="text-safar-gray hover:text-safar-ink"
            title="Copy Booking ID"
            aria-label={`Copy booking ID ${item.bookingId}`}
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(item.bookingId);
            }}
          >
            {copiedId === item.bookingId ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      ),
    },
    {
      label: "Passenger",
      render: (item) => (
        <div>
          <p className="font-bold text-safar-ink">{item.passengerName}</p>
          <p className="text-xs text-safar-gray">
            {item.universityId || item.email} ·{" "}
            <span className="font-semibold text-safar-teal">{item.roleLabel}</span>
          </p>
        </div>
      ),
    },
    {
      label: "Bus & Route",
      render: (item) => (
        <div>
          <p className="font-semibold text-safar-ink">
            {item.busName} {item.busNumber ? `(${item.busNumber})` : ""}
          </p>
          <p className="text-xs text-safar-gray">{item.route}</p>
        </div>
      ),
    },
    {
      label: "Trip Date & Time",
      render: (item) => (
        <div>
          <p className="font-medium text-safar-ink">{item.date}</p>
          <p className="text-xs text-safar-gray">{item.departureTime}</p>
        </div>
      ),
    },
    {
      label: "Seat",
      render: (item) => (
        <span className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-safar-ink">
          {item.seatNumber}
        </span>
      ),
    },
    {
      label: "Reservation",
      render: (item) => <AdminStatusBadge status={item.status} />,
    },
    {
      label: "Boarding",
      render: (item) => <AdminStatusBadge status={item.boardingStatus} />,
    },
    {
      label: "Actions",
      render: (item) => (
        <button
          type="button"
          className="focus-ring inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-safar-teal hover:bg-slate-100"
          onClick={() => handleOpenEdit(item)}
          aria-label={`Update reservation ${item.bookingId}`}
        >
          <Pencil className="h-3.5 w-3.5" />
          Update
        </button>
      ),
    },
  ];

  const hasActiveFilters = Object.entries(filters).some(([k, v]) =>
    k === "date" ? Boolean(v) : v !== "All"
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Passenger Operations"
          title="Reservations"
          description="View, filter, and audit database-driven passenger reservations and boarding status across every bus, route, and schedule."
        />

        {error && <ErrorState title="Reservations unavailable" message={error} onRetry={loadData} />}

        {/* Database-Driven Filter Bar */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-safar-gray">
                Date
              </span>
              <input
                className="focus-ring h-10 w-full rounded-xl border border-slate-200 px-3 text-xs sm:text-sm text-safar-ink"
                type="date"
                value={filters.date}
                onChange={setFilter("date")}
              />
            </label>
            <Select label="Bus" value={filters.bus} onChange={setFilter("bus")}>
              {filterBusOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Select label="Route" value={filters.route} onChange={setFilter("route")}>
              {filterRouteOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Select label="User Type" value={filters.role} onChange={setFilter("role")}>
              {filterRoleOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Select label="Status" value={filters.status} onChange={setFilter("status")}>
              {filterStatusOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Select
              label="Boarding"
              value={filters.boardingStatus}
              onChange={setFilter("boardingStatus")}
            >
              {filterBoardingOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-safar-gray">
              Showing <span className="font-bold text-safar-ink">{visible.length}</span> of{" "}
              <span className="font-bold text-safar-ink">{reservations.length}</span> reservations
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-safar-teal hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </section>

        {loading ? (
          <Loading label="Loading database reservations..." />
        ) : visible.length ? (
          <ResponsiveDataList
            columns={columns}
            rows={visible}
            rowKey="bookingId"
            renderMobile={(item) => (
              <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-safar-ink">{item.passengerName}</h2>
                    <p className="text-xs text-safar-gray">
                      {item.universityId || item.email} ·{" "}
                      <span className="font-semibold text-safar-teal">{item.roleLabel}</span>
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-sm font-bold text-safar-ink">
                    Seat {item.seatNumber}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <p className="font-semibold text-safar-ink">
                    {item.busName} {item.busNumber ? `(${item.busNumber})` : ""}
                  </p>
                  <p className="text-safar-gray">{item.route}</p>
                  <p className="text-safar-gray">
                    {item.date} at {item.departureTime}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap gap-2">
                    <AdminStatusBadge status={item.status} />
                    <AdminStatusBadge status={item.boardingStatus} />
                  </div>
                  <button
                    type="button"
                    className="focus-ring inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-safar-teal hover:bg-slate-50"
                    onClick={() => handleOpenEdit(item)}
                    aria-label={`Update reservation ${item.bookingId}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Update
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-safar-gray">
                  <span className="font-mono text-[11px]">{item.bookingId}</span>
                  <button
                    type="button"
                    className="text-safar-teal hover:underline text-[11px]"
                    onClick={() => copyToClipboard(item.bookingId)}
                  >
                    Copy ID
                  </button>
                </div>
              </article>
            )}
          />
        ) : (
          <EmptyState
            title="No reservations found"
            message={
              hasActiveFilters
                ? "No reservations match your current filter selections. Try adjusting or resetting your filters."
                : "No passenger reservations have been created in the database yet."
            }
            action={
              hasActiveFilters && (
                <Button variant="secondary" onClick={resetFilters}>
                  Clear All Filters
                </Button>
              )
            }
          />
        )}

        {/* Admin Update Modal */}
        <AdminFormModal
          open={!!editing}
          title="Update Reservation Status"
          onClose={() => setEditing(null)}
          onSubmit={handleUpdateSubmit}
          submitLabel={saving ? "Saving Changes..." : "Save Updates"}
        >
          {editing && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-safar-ink space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-safar-ink">{editing.passengerName}</span>
                  <span className="font-mono text-xs text-safar-gray">{editing.bookingId}</span>
                </div>
                <p className="text-safar-gray">
                  ID: <span className="font-semibold text-safar-ink">{editing.universityId || editing.email}</span> · Role: <span className="font-semibold text-safar-teal">{editing.roleLabel}</span>
                </p>
                <div className="border-t border-slate-200 pt-2 grid grid-cols-2 gap-2 text-safar-gray">
                  <div>Bus: <strong className="text-safar-ink">{editing.busName}</strong></div>
                  <div>Route: <strong className="text-safar-ink">{editing.route}</strong></div>
                  <div>Seat: <strong className="text-safar-ink">{editing.seatNumber}</strong></div>
                  <div>Date: <strong className="text-safar-ink">{editing.date}</strong></div>
                </div>
              </div>

              <Select
                label="Reservation Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                required
              >
                {reservationStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>

              <Select
                label="Boarding Status"
                value={form.boardingStatus}
                onChange={(e) => setForm({ ...form, boardingStatus: e.target.value })}
                required
              >
                {boardingStatuses.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </AdminFormModal>
      </div>
    </DashboardLayout>
  );
}
