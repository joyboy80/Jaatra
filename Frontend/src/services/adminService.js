import { buses as busDefaults } from "../data/buses.js";
import { trips } from "../data/trips.js";
import { toDateInputValue } from "../utils/date.js";
import { apiRequest, backendEnabled } from "./api.js";

const KEYS = {
  buses: "jaatra.admin.buses",
  routes: "jaatra.admin.routes",
  schedules: "jaatra.admin.schedules",
  users: "jaatra.admin.users",
  drivers: "jaatra.admin.drivers",
  maintenance: "jaatra.admin.maintenance",
  reservations: "jaatra.reservations",
  driverOperations: "jaatra.driver.operations",
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(key, fallback) {
  if (typeof localStorage === "undefined") return clone(fallback);
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value || clone(fallback);
  } catch (_error) {
    return clone(fallback);
  }
}

function writeJson(key, value) {
  if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const today = () => toDateInputValue(new Date());

const routeDefaults = [...new Map(busDefaults.map((bus) => [bus.route, bus])).values()].map((bus, index) => ({
  id: `RTE-${String(index + 1).padStart(3, "0")}`,
  name: `Campus Route ${String.fromCharCode(65 + index)}`,
  start: bus.stops[0],
  destination: bus.stops[bus.stops.length - 1],
  stops: bus.stops,
  assignedBusIds: busDefaults.filter((item) => item.route === bus.route).map((item) => item.id),
  estimatedMinutes: 45 + index * 5,
}));

const scheduleTypes = ["Regular", "Weekend", "Holiday", "Exam", "Special Event"];
const scheduleDefaults = trips.slice(0, 18).map((trip, index) => ({
  id: `SCH-${String(index + 1).padStart(3, "0")}`,
  tripId: trip.id,
  busId: trip.busId,
  busName: trip.busName,
  route: trip.route,
  date: today(),
  departureTime: trip.departureTime,
  arrivalTime: trip.arrivalTime,
  busCategory: trip.busCategory,
  scheduleType: scheduleTypes[index % scheduleTypes.length],
  status: index % 7 === 0 ? "Delayed" : index % 5 === 0 ? "In Progress" : "Scheduled",
}));

const seededReservations = [
  { bookingId: "BKG-10041", passengerName: "Ayesha Siddika", universityId: "STU-2026-0110", roleLabel: "Student", busId: "BUS-002", busName: "Meghna", route: "Science Annex - North Hall", date: today(), departureTime: "07:30 AM", seatNumber: "1A", status: "Confirmed", boardingStatus: "Boarded" },
  { bookingId: "BKG-10042", passengerName: "Nabila Islam", universityId: "STU-2026-0124", roleLabel: "Student", busId: "BUS-002", busName: "Meghna", route: "Science Annex - North Hall", date: today(), departureTime: "07:30 AM", seatNumber: "1B", status: "Confirmed", boardingStatus: "Boarded" },
  { bookingId: "BKG-10043", passengerName: "Dr. Fahim Hasan", universityId: "FAC-2026-0051", roleLabel: "Teacher", busId: "BUS-003", busName: "Padma", route: "Central Library - South Hall", date: today(), departureTime: "10:00 AM", seatNumber: "2C", status: "Confirmed", boardingStatus: "Not Boarded" },
  { bookingId: "BKG-10044", passengerName: "Rafiq Uddin", universityId: "STF-2026-0108", roleLabel: "Staff", busId: "BUS-004", busName: "Jamuna", route: "Medical Gate - Faculty Quarter", date: today(), departureTime: "04:30 PM", seatNumber: "3A", status: "Confirmed", boardingStatus: "Not Boarded" },
  { bookingId: "BKG-10045", passengerName: "Tasnim Ahmed", universityId: "STU-2026-0207", roleLabel: "Student", busId: "BUS-001", busName: "Surma", route: "Main Campus - Medical Gate", date: today(), departureTime: "07:30 AM", seatNumber: "4B", status: "Cancelled", boardingStatus: "Cancelled" },
];

const userDefaults = [
  ["USR-001", "Mahbubur Rahman", "STU-2026-0142", "Student", "mahbubur@university.edu"],
  ["USR-002", "Ayesha Siddika", "STU-2026-0110", "Student", "ayesha@university.edu"],
  ["USR-003", "Nabila Islam", "STU-2026-0124", "Student", "nabila@university.edu"],
  ["USR-004", "Dr. Nusrat Jahan", "FAC-2026-0031", "Teacher", "nusrat@university.edu"],
  ["USR-005", "Dr. Fahim Hasan", "FAC-2026-0051", "Teacher", "fahim@university.edu"],
  ["USR-006", "Imran Chowdhury", "STF-2026-0087", "Staff", "imran@university.edu"],
  ["USR-007", "Rafiq Uddin", "STF-2026-0108", "Staff", "rafiq@university.edu"],
  ["USR-008", "Mizan Rahman", "DRV-2026-0019", "Driver", "mizan@university.edu"],
].map(([id, name, universityId, role, email]) => ({ id, name, universityId, role, email, status: "Active" }));

const driverContacts = ["+880 1711 458920", "+880 1712 310482", "+880 1814 225711", "+880 1913 500219", "+880 1716 418730", "+880 1819 612044"];
const driverDefaults = [...new Set(busDefaults.map((bus) => bus.assignedDriver))].map((name, index) => {
  const assigned = busDefaults.filter((bus) => bus.assignedDriver === name);
  return {
    id: `DRV-2026-${String(index + 1).padStart(4, "0")}`,
    name,
    assignedBusId: assigned[0]?.id || "",
    assignedBus: assigned[0]?.name || "Unassigned",
    contact: driverContacts[index],
    status: index === 1 ? "On Trip" : index === 4 ? "Off Duty" : "Available",
    completedTrips: 18 + index * 7,
  };
});

const maintenanceDefaults = busDefaults.slice(0, 8).map((bus, index) => ({
  id: `MNT-${String(index + 1).padStart(3, "0")}`,
  busId: bus.id,
  busName: bus.name,
  condition: index === 2 ? "Critical" : index % 3 === 1 ? "Minor Issue" : "Good",
  lastMaintenance: `2026-${String(7 + (index % 2)).padStart(2, "0")}-${String(3 + index).padStart(2, "0")}`,
  nextMaintenance: `2026-09-${String(4 + index).padStart(2, "0")}`,
  reportedIssue: index === 2 ? "Brake pressure requires inspection" : index % 3 === 1 ? "AC cooling performance" : "No open issue",
  status: index === 2 ? "Under Maintenance" : index % 3 === 1 ? "Minor Issue" : "Good",
}));

export async function getAdminBuses() {
  if (backendEnabled) return (await apiRequest("/admin/transport/buses")).buses;
  return readJson(KEYS.buses, busDefaults);
}

export async function saveBus(input) {
  if (backendEnabled) return (await apiRequest("/admin/transport/buses", { method: "PUT", body: input })).bus;
  const current = await getAdminBuses();
  const existing = current.find((bus) => bus.id === input.id);
  const bus = {
    ...(existing || {}),
    ...input,
    id: input.id || makeId("BUS"),
    capacity: Number(input.capacity),
    availableSeats: existing?.availableSeats ?? Number(input.capacity),
    stops: input.stops?.length ? input.stops : [input.route?.split(" - ")[0] || "Campus", input.route?.split(" - ")[1] || "Destination"],
    currentLocation: existing?.currentLocation || { label: "Transport Yard", lat: 23.75, lng: 90.4 },
  };
  writeJson(KEYS.buses, existing ? current.map((item) => item.id === bus.id ? bus : item) : [...current, bus]);
  return bus;
}

export async function deleteBus(id) {
  if (backendEnabled) return apiRequest(`/admin/transport/buses/${encodeURIComponent(id)}`, { method: "DELETE" });
  return writeJson(KEYS.buses, (await getAdminBuses()).filter((bus) => bus.id !== id));
}

export async function getAdminRoutes() {
  if (backendEnabled) return (await apiRequest("/admin/transport/routes")).routes;
  return readJson(KEYS.routes, routeDefaults);
}

export async function saveRoute(input) {
  if (backendEnabled) return (await apiRequest("/admin/transport/routes", { method: "PUT", body: input })).route;
  const current = await getAdminRoutes();
  const existing = current.find((route) => route.id === input.id);
  const route = { ...existing, ...input, id: input.id || makeId("RTE"), estimatedMinutes: Number(input.estimatedMinutes) };
  writeJson(KEYS.routes, existing ? current.map((item) => item.id === route.id ? route : item) : [...current, route]);
  return route;
}

export async function deleteRoute(id) {
  if (backendEnabled) return apiRequest(`/admin/transport/routes/${encodeURIComponent(id)}`, { method: "DELETE" });
  return writeJson(KEYS.routes, (await getAdminRoutes()).filter((route) => route.id !== id));
}

export async function getAdminSchedules() {
  if (backendEnabled) return (await apiRequest("/admin/transport/schedules")).schedules;
  return readJson(KEYS.schedules, scheduleDefaults);
}

export async function saveSchedule(input) {
  if (backendEnabled) return (await apiRequest("/admin/transport/schedules", { method: "PUT", body: input })).schedule;
  const current = await getAdminSchedules();
  const existing = current.find((schedule) => schedule.id === input.id);
  const schedule = { ...existing, ...input, id: input.id || makeId("SCH"), status: input.status || "Scheduled" };
  writeJson(KEYS.schedules, existing ? current.map((item) => item.id === schedule.id ? schedule : item) : [...current, schedule]);
  return schedule;
}

export async function deleteSchedule(id) {
  if (backendEnabled) return apiRequest(`/admin/transport/schedules/${encodeURIComponent(id)}`, { method: "DELETE" });
  return writeJson(KEYS.schedules, (await getAdminSchedules()).filter((schedule) => schedule.id !== id));
}

export async function getAdminReservations() {
  if (backendEnabled) return (await apiRequest("/admin/transport/reservations")).reservations;
  const actual = readJson(KEYS.reservations, []);
  return [...actual.map((item) => ({ ...item, boardingStatus: item.boardingStatus || "Not Boarded" })), ...seededReservations];
}

export async function getAdminUsers() {
  if (backendEnabled) return (await apiRequest("/admin/transport/users")).users;
  return readJson(KEYS.users, userDefaults);
}

export async function updateUser(id, updates) {
  if (backendEnabled) return (await apiRequest(`/admin/transport/users/${encodeURIComponent(id)}`, { method: "PUT", body: updates })).user;
  const users = (await getAdminUsers()).map((user) => user.id === id ? { ...user, ...updates } : user);
  writeJson(KEYS.users, users);
  return users.find((user) => user.id === id);
}

export async function getAdminDrivers() {
  if (backendEnabled) return (await apiRequest("/admin/transport/drivers")).drivers;
  return readJson(KEYS.drivers, driverDefaults);
}

export async function updateDriver(id, updates) {
  if (backendEnabled) return (await apiRequest(`/admin/transport/drivers/${encodeURIComponent(id)}`, { method: "PUT", body: updates })).driver;
  const drivers = (await getAdminDrivers()).map((driver) => driver.id === id ? { ...driver, ...updates } : driver);
  writeJson(KEYS.drivers, drivers);
  return drivers.find((driver) => driver.id === id);
}

export async function getMaintenanceRecords() {
  if (backendEnabled) return (await apiRequest("/admin/transport/maintenance")).maintenance;
  const records = readJson(KEYS.maintenance, maintenanceDefaults);
  const operations = readJson(KEYS.driverOperations, {});
  const latestReports = operations.conditionReports || [];
  return records.map((record) => {
    const report = latestReports.find((item) => item.busId === record.busId);
    return report ? { ...record, condition: report.condition, reportedIssue: report.description, reportId: report.id } : record;
  });
}

export async function updateMaintenance(id, updates) {
  if (backendEnabled) return (await apiRequest(`/admin/transport/maintenance/${encodeURIComponent(id)}`, { method: "PUT", body: updates })).maintenance;
  const stored = readJson(KEYS.maintenance, maintenanceDefaults);
  const records = stored.map((record) => record.id === id ? { ...record, ...updates } : record);
  writeJson(KEYS.maintenance, records);
  return records.find((record) => record.id === id);
}

export async function getOperationalAlerts() {
  if (backendEnabled) return (await apiRequest("/admin/transport/alerts")).alerts;
  const operations = readJson(KEYS.driverOperations, {});
  return {
    conditions: operations.conditionReports || [],
    delays: operations.delayReports || [],
    emergencies: operations.emergencyAlerts || [],
  };
}

export async function getAdminOverview() {
  if (backendEnabled) return (await apiRequest("/admin/transport/overview")).overview;
  const [buses, schedules, reservations, maintenance, alerts] = await Promise.all([
    getAdminBuses(),
    getAdminSchedules(),
    getAdminReservations(),
    getMaintenanceRecords(),
    getOperationalAlerts(),
  ]);
  return {
    buses,
    schedules,
    reservations,
    maintenance,
    alerts,
    stats: {
      totalBuses: buses.length,
      activeBuses: buses.filter((bus) => !["Arrived", "Under Maintenance"].includes(bus.status)).length,
      todayTrips: schedules.filter((schedule) => schedule.date === today()).length,
      totalReservations: reservations.filter((reservation) => reservation.status !== "Cancelled").length,
      availableSeats: buses.reduce((sum, bus) => sum + Number(bus.availableSeats || 0), 0),
      delayedBuses: schedules.filter((schedule) => schedule.status === "Delayed").length,
      maintenanceBuses: maintenance.filter((record) => record.status === "Under Maintenance").length,
      emergencyReports: alerts.emergencies.length,
    },
  };
}

export async function getAnalytics() {
  if (backendEnabled) return (await apiRequest("/admin/transport/analytics")).analytics;
  const reservations = await getAdminReservations();
  return {
    daily: [22, 31, 27, 42, 48, 35, Math.max(18, reservations.length * 4)],
    weekly: [168, 194, 223, 207],
    occupancy: [
      { label: "Student", value: 82 },
      { label: "Female Student", value: 76 },
      { label: "Teacher", value: 61 },
      { label: "Staff", value: 68 },
    ],
    routes: routeDefaults.slice(0, 5).map((route, index) => ({ label: route.name, value: 92 - index * 11 })),
    peakHours: [
      { label: "7 AM", value: 91 }, { label: "9 AM", value: 64 }, { label: "11 AM", value: 48 },
      { label: "2 PM", value: 55 }, { label: "4 PM", value: 88 }, { label: "6 PM", value: 70 },
    ],
    cancellationRate: 6.4,
    noShowRate: 4.8,
    utilization: 73,
  };
}

export { scheduleTypes };
