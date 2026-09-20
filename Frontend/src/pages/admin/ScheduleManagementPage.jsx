import { Plus, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminFormModal from "../../components/admin/AdminFormModal";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import Select from "../../components/common/Select";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  cancelAssignment,
  getAdminAssignments,
  getAdminBuses,
  getAdminDrivers,
  getAdminRoutes,
  saveAssignment,
} from "../../services/adminService";
import { toDateInputValue } from "../../utils/date";

const shifts = {
  MORNING: { label: "Morning (05:45 AM / 07:10 AM)", outboundTime: "05:45 AM", returnTime: "07:10 AM" },
  NOON: { label: "Noon (01:30 PM / 02:20 PM)", outboundTime: "01:30 PM", returnTime: "02:20 PM" },
  AFTERNOON: { label: "Afternoon & Night (04:15 PM / 08:45 PM)", outboundTime: "04:15 PM", returnTime: "08:45 PM" },
  SATURDAY_AFTERNOON: { label: "Saturday — Afternoon & Night (02:30 PM / 08:15 PM)", outboundTime: "02:30 PM", returnTime: "08:15 PM" },
};
const groups = [
  ["ALL_STUDENTS", "All Students"],
  ["FEMALE_STUDENTS", "Female Students"],
  ["ALL_TEACHERS", "All Teachers"],
  ["ALL_STAFF", "All Staff"],
  ["ALL_USERS", "All Passengers"],
];
const blank = () => ({
  serviceDate: toDateInputValue(),
  shift: "MORNING",
  passengerGroup: "ALL_STUDENTS",
  driverProfileId: "",
  busId: "",
  busName: "",
  busNumber: "",
  capacity: 40,
});

export default function ScheduleManagementPage() {
  const { setToast } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [assignmentsData, busesData, routesData, driversData] = await Promise.all([
        getAdminAssignments(),
        getAdminBuses(),
        getAdminRoutes(),
        getAdminDrivers(),
      ]);
      setAssignments(assignmentsData);
      setBuses(busesData);
      setRoutes(routesData);
      setDrivers(driversData || []);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!form.busId && !form.busName) {
      setToast({ type: "error", message: "Please select a bus from the database." });
      return;
    }
    if (!form.driverProfileId) {
      setToast({ type: "error", message: "Please select a driver from the database." });
      return;
    }
    try {
      await saveAssignment(form);
      setForm(null);
      setToast({
        type: "success",
        message: "Assignment saved; outbound and return trips are open.",
      });
      await load();
    } catch (err) {
      setError(err.message);
      setToast({ type: "error", message: err.message });
    }
  }

  async function cancel() {
    try {
      await cancelAssignment(removing.id);
      setRemoving(null);
      setToast({ type: "info", message: "Assignment cancelled." });
      await load();
    } catch (err) {
      setError(err.message);
      setToast({ type: "error", message: err.message });
      setRemoving(null);
    }
  }

  const selectedBus = useMemo(
    () => buses.find((b) => b.id === form?.busId),
    [buses, form?.busId]
  );

  const selectedDriver = useMemo(
    () => drivers.find((d) => d.id === form?.driverProfileId),
    [drivers, form?.driverProfileId]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Service Planning"
          title="Schedules"
          description="Publish a dated bus schedule for a verified, active Driver and passenger group. Eligible users can view and reserve both trips on its service date."
          actions={
            <Button icon={Plus} onClick={() => setForm(blank())}>
              Add Schedule
            </Button>
          }
        />
        {error && <ErrorState title="Assignments unavailable" message={error} />}
        {loading ? (
          <Loading label="Loading assignments" />
        ) : assignments.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {assignments.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-safar-teal">
                      {item.serviceDate} · {item.shift}
                    </p>
                    <h2 className="mt-1 font-bold text-safar-ink">
                      {item.busName} ({item.busNumber})
                    </h2>
                    <p className="text-sm text-safar-gray">
                      {item.passengerGroupLabel} · <span className="font-semibold text-safar-ink">Driver: {item.driverName || item.driverEmail || "Unassigned"}</span>
                    </p>
                  </div>
                  <button
                    className="text-red-600"
                    aria-label="Cancel assignment"
                    onClick={() => setRemoving(item)}
                  >
                    <XCircle />
                  </button>
                </div>
                <div className="mt-4 space-y-1 text-sm text-safar-gray">
                  {item.trips.map((trip) => (
                    <p key={trip.id}>
                      {trip.direction}: {trip.route} — {trip.departureTime}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No daily assignments"
            message="Create an assignment to publish its outbound and return trips."
          />
        )}

        <AdminFormModal
          open={!!form}
          title="Daily bus assignment"
          onClose={() => setForm(null)}
          onSubmit={submit}
          submitLabel="Save Assignment"
        >
          {form && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-semibold">Service date</span>
                  <input
                    type="date"
                    required
                    className="focus-ring h-11 w-full rounded-xl border border-slate-200 px-3"
                    value={form.serviceDate}
                    onChange={(e) => setForm({ ...form, serviceDate: e.target.value })}
                  />
                </label>
                <Select
                  label="Shift"
                  value={form.shift}
                  onChange={(e) => setForm({ ...form, shift: e.target.value })}
                >
                  {Object.entries(shifts).map(([shiftKey, config]) => (
                    <option key={shiftKey} value={shiftKey}>
                      {config.label}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Passenger group"
                  value={form.passengerGroup}
                  onChange={(e) => setForm({ ...form, passengerGroup: e.target.value })}
                >
                  {groups.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <div>
                  <Select
                    label="Select Driver"
                    value={form.driverProfileId || ""}
                    onChange={(e) => setForm({ ...form, driverProfileId: e.target.value })}
                    required
                  >
                    <option value="" disabled>
                      {drivers.length ? "-- Select Driver --" : "Loading drivers..."}
                    </option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </Select>
                  {selectedDriver && (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-safar-ink flex items-center justify-between">
                      <div>
                        <span className="font-bold">{selectedDriver.name}</span>
                        {selectedDriver.contact && (
                          <span className="text-safar-gray"> · Contact: {selectedDriver.contact}</span>
                        )}
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                        Driver Active
                      </span>
                    </div>
                  )}
                  {!drivers.length && !loading && (
                    <p className="mt-1 text-xs text-amber-600">
                      No registered driver accounts found.
                    </p>
                  )}
                </div>
                <div>
                  <Select
                    label="Select Bus from Fleet"
                    value={form.busId || ""}
                    onChange={(e) => {
                      const busId = e.target.value;
                      const matched = buses.find((b) => b.id === busId);
                      setForm({
                        ...form,
                        busId,
                        busName: matched ? matched.name : form.busName,
                        busNumber: matched ? matched.number : form.busNumber,
                        capacity: matched ? matched.capacity : form.capacity,
                      });
                    }}
                    required
                  >
                    <option value="" disabled>
                      {buses.length ? "-- Select Fleet Bus --" : "Loading buses..."}
                    </option>
                    {buses.map((bus) => (
                      <option key={bus.id} value={bus.id}>
                        {bus.name} ({bus.number}) - {bus.route || "CUET Route"}
                      </option>
                    ))}
                  </Select>
                </div>
                {selectedBus && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-safar-ink">
                    <span className="font-bold">{selectedBus.name}</span>
                    <span className="text-safar-gray">
                      {" "}
                      · Number: {selectedBus.number} · Capacity: {selectedBus.capacity} seats · Status: {selectedBus.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Database-Driven Route and Schedule Preview */}
              {(() => {
                const isFlyover = selectedBus?.routeId?.includes("FLYOVER") || selectedBus?.route?.toLowerCase().includes("flyover");
                const isGec = selectedBus?.routeId?.includes("GEC") || selectedBus?.route?.toLowerCase().includes("gec");

                let defaultOutboundId = "CUET_STATION_DIRECT";
                if (isFlyover && isGec) defaultOutboundId = "CUET_STATION_FLYOVER_GEC";
                else if (isGec) defaultOutboundId = "CUET_STATION_GEC";

                let defaultReturnId = isGec ? "STATION_CUET_GEC" : "STATION_CUET_BAHADDARHAT";

                const outboundRoute = routes.find((r) => r.id === (selectedBus?.routeId || defaultOutboundId)) || routes.find((r) => r.id === defaultOutboundId) || routes[0];
                const returnRoute = routes.find((r) => r.id === defaultReturnId) || routes[3] || routes[1];
                const shiftTimes = shifts[form.shift] || shifts.MORNING;

                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 p-4 text-xs sm:text-sm text-safar-ink">
                    <p className="font-bold text-safar-ink">Database-Driven Route and Schedule Preview</p>
                    <div className="mt-3 space-y-2.5">
                      <div className="rounded-lg border border-slate-200/80 dark:border-slate-700/80 p-3">
                        <span className="font-bold text-safar-teal">Outbound ({shiftTimes.outboundTime}):</span>
                        <p className="font-semibold text-safar-ink mt-0.5">{outboundRoute?.name || "CUET Campus - Station"}</p>
                        <p className="text-xs text-safar-gray mt-0.5">
                          {outboundRoute?.stops?.length ? `${outboundRoute.stops.length} stops: ${outboundRoute.stops[0]} → ... → ${outboundRoute.stops.at(-1)}` : ""}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200/80 dark:border-slate-700/80 p-3">
                        <span className="font-bold text-safar-teal">Return ({shiftTimes.returnTime}):</span>
                        <p className="font-semibold text-safar-ink mt-0.5">{returnRoute?.name || "Station - CUET Campus"}</p>
                        <p className="text-xs text-safar-gray mt-0.5">
                          {returnRoute?.stops?.length ? `${returnRoute.stops.length} stops: ${returnRoute.stops[0]} → ... → ${returnRoute.stops.at(-1)}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </AdminFormModal>

        <Modal
          open={!!removing}
          title="Cancel assignment?"
          description="Cancellation is blocked until any affected active reservations are safely resolved."
          confirmLabel="Cancel Assignment"
          danger
          onClose={() => setRemoving(null)}
          onConfirm={cancel}
        />
      </div>
    </DashboardLayout>
  );
}
