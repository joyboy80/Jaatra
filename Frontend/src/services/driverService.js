import { assignedBus, driverProfile, getDriverTrips, seededPassengers } from "../data/driverOperations.js";
import { apiRequest, backendEnabled } from "./api.js";
import { getStoredAuth } from "./authService.js";

const OPERATIONS_KEY = "jaatra.driver.operations";
const RESERVATION_KEY = "jaatra.reservations";
const TICKET_KEY = "jaatra.tickets";

function readJson(key, fallback) {
  if (typeof localStorage === "undefined") return fallback;

  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

function getOperations() {
  return readJson(OPERATIONS_KEY, {
    tripStatuses: {},
    boarding: {},
    conditionReports: [],
    delayReports: [],
    emergencyAlerts: [],
  });
}

function saveOperations(next) {
  writeJson(OPERATIONS_KEY, next);
  return next;
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function getAssignedTrips() {
  if (backendEnabled) {
    const nextTrips = (await apiRequest("/driver/transport/trips")).trips;
    const first = nextTrips[0];
    const user = getStoredAuth()?.user;
    if (user) Object.assign(driverProfile, { id: user.universityId || user.id, name: user.name, phone: user.phone });
    if (first) Object.assign(assignedBus, {
      id: first.busId,
      name: first.busName,
      number: first.busNumber,
      type: first.busCategory,
      capacity: first.capacity,
      route: first.route,
      currentLocation: { label: first.currentLocation || "Transport Yard" },
      nextStop: first.nextStop,
      eta: first.eta,
    });
    else Object.assign(assignedBus, {
      id: "",
      name: "Unassigned",
      number: "—",
      type: "No bus assigned",
      capacity: 0,
      route: "No active route",
      currentLocation: { label: "Transport Yard" },
      nextStop: "—",
      eta: "—",
    });
    return nextTrips;
  }
  const operations = getOperations();
  return getDriverTrips().map((trip) => ({
    ...trip,
    status: operations.tripStatuses[trip.id] || trip.status,
  }));
}

export async function getCurrentTrip() {
  const trips = await getAssignedTrips();
  return trips.find((trip) => ["Boarding", "In Progress"].includes(trip.status)) || trips.find((trip) => trip.status === "Upcoming") || trips[0];
}

function seededTicketsForTrip(trip) {
  const firstTrip = getDriverTrips()[0];
  if (!trip || trip.id !== firstTrip.id) return [];

  return seededPassengers.map((passenger) => ({
    ...passenger,
    id: passenger.ticketId,
    tripId: trip.id,
    busId: trip.busId,
    busName: trip.busName,
    route: trip.route,
    date: trip.date,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    status: passenger.ticketStatus || "Confirmed",
  }));
}

function allTickets() {
  const trips = getDriverTrips();
  return [...trips.flatMap(seededTicketsForTrip), ...readJson(TICKET_KEY, [])];
}

export async function getPassengerManifest(tripId) {
  if (backendEnabled) return (await apiRequest(`/driver/transport/trips/${encodeURIComponent(tripId)}/passengers`)).passengers;
  const trips = await getAssignedTrips();
  const trip = trips.find((item) => item.id === tripId);
  if (!trip) return [];

  const operations = getOperations();
  const reservations = readJson(RESERVATION_KEY, []).filter(
    (reservation) => reservation.tripId === trip.id && reservation.date === trip.date
  );
  const actualPassengers = reservations.map((reservation) => ({
    ...reservation,
    id: reservation.ticketId,
    roleLabel: reservation.roleLabel || reservation.role,
    status: reservation.status,
    boardingStatus: reservation.status === "Cancelled" ? "Cancelled" : "Not Boarded",
  }));

  return [...seededTicketsForTrip(trip), ...actualPassengers].map((passenger) => ({
    ...passenger,
    boardingStatus:
      passenger.status === "Cancelled"
        ? "Cancelled"
        : operations.boarding[passenger.ticketId]?.status || passenger.boardingStatus || "Not Boarded",
  }));
}

export async function getTripSummary(tripId) {
  if (backendEnabled) return (await apiRequest(`/driver/transport/trips/${encodeURIComponent(tripId)}/summary`)).summary;
  const trip = (await getAssignedTrips()).find((item) => item.id === tripId);
  const passengers = await getPassengerManifest(tripId);
  const activePassengers = passengers.filter((passenger) => passenger.boardingStatus !== "Cancelled");
  const boarded = activePassengers.filter((passenger) => passenger.boardingStatus === "Boarded").length;

  return {
    trip,
    passengerCount: activePassengers.length,
    boarded,
    waiting: activePassengers.length - boarded,
    capacity: trip?.capacity || assignedBus.capacity,
  };
}

export async function verifyTicket(ticketId, currentTripId) {
  if (backendEnabled) return (await apiRequest("/driver/transport/tickets/verify", { method: "POST", body: { ticketId, tripId: currentTripId } })).ticket;
  const normalizedId = ticketId.trim().toUpperCase();
  const trip = (await getAssignedTrips()).find((item) => item.id === currentTripId);
  const ticket = allTickets().find((item) => item.ticketId.toUpperCase() === normalizedId);

  if (!ticket) throw new Error("Ticket does not exist.");
  if (!trip) throw new Error("No active trip is selected.");
  if (ticket.busId !== trip.busId) throw new Error("Ticket is for a different bus.");
  if (ticket.tripId !== trip.id) throw new Error("Ticket is for a different trip or departure time.");
  if (ticket.date !== trip.date) throw new Error("Ticket is not valid for today's date.");
  if (ticket.status === "Cancelled") throw new Error("This ticket has been cancelled.");
  if (["Used", "Expired"].includes(ticket.status)) throw new Error("This ticket has already been used or expired.");

  const operations = getOperations();
  if (operations.boarding[ticket.ticketId]?.status === "Boarded") {
    throw new Error("This ticket has already been scanned.");
  }

  operations.boarding[ticket.ticketId] = {
    status: "Boarded",
    scannedAt: new Date().toISOString(),
    tripId: trip.id,
  };
  saveOperations(operations);

  const storedTickets = readJson(TICKET_KEY, []);
  writeJson(
    TICKET_KEY,
    storedTickets.map((item) =>
      item.ticketId === ticket.ticketId ? { ...item, status: "Used", usedAt: new Date().toISOString() } : item
    )
  );

  return { ...ticket, status: "Verified", boardingStatus: "Boarded" };
}

export async function updateTripStatus(tripId, status) {
  const allowed = ["Upcoming", "Boarding", "In Progress", "Completed", "Cancelled"];
  if (!allowed.includes(status)) throw new Error("Unsupported trip status.");

  if (backendEnabled) return (await apiRequest(`/driver/transport/trips/${encodeURIComponent(tripId)}/status`, { method: "PATCH", body: { status } })).trip;

  const operations = getOperations();
  operations.tripStatuses[tripId] = status;
  saveOperations(operations);
  return (await getAssignedTrips()).find((trip) => trip.id === tripId);
}

export async function submitConditionReport(report) {
  if (backendEnabled) return (await apiRequest("/driver/transport/reports/condition", { method: "POST", body: report })).report;
  const operations = getOperations();
  const saved = { ...report, id: makeId("COND"), driverId: driverProfile.id, createdAt: new Date().toISOString() };
  operations.conditionReports.unshift(saved);
  saveOperations(operations);
  return saved;
}

export async function submitDelayReport(report) {
  if (backendEnabled) return (await apiRequest("/driver/transport/reports/delay", { method: "POST", body: report })).report;
  const operations = getOperations();
  const saved = { ...report, id: makeId("DLY"), driverId: driverProfile.id, createdAt: new Date().toISOString() };
  operations.delayReports.unshift(saved);
  saveOperations(operations);
  return saved;
}

export async function sendEmergencyAlert(alert) {
  if (backendEnabled) return (await apiRequest("/driver/transport/reports/emergency", { method: "POST", body: alert })).report;
  const operations = getOperations();
  const saved = { ...alert, id: makeId("SOS"), driverId: driverProfile.id, createdAt: new Date().toISOString(), status: "Sent" };
  operations.emergencyAlerts.unshift(saved);
  saveOperations(operations);
  return saved;
}

export { assignedBus, driverProfile };
