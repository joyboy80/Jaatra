import { getSupabaseAdmin } from "../config/supabase.js";
import AppError from "../utils/AppError.js";

const CATEGORY_BY_ROLE = {
  STUDENT: ["Student Bus", "Female Student Bus"],
  TEACHER: ["Teacher Bus"],
  STAFF: ["Staff Bus"],
};

const ROLE_LABELS = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  STAFF: "Staff",
  DRIVER: "Driver",
  TRANSPORT_ADMIN: "Transport Authority",
};

export const SHIFT_DEFINITIONS = {
  MORNING: { outbound: { route: "CUET to Station", departureTime: "05:45 AM" }, return: { route: "Station to CUET", departureTime: "07:10 AM" } },
  NOON: { outbound: { route: "CUET to Kaptai Rastar Matha", departureTime: "01:30 PM" }, return: { route: "Kaptai Rastar Matha to CUET", departureTime: "02:15 PM" } },
  AFTERNOON: { outbound: { route: "CUET to Station", departureTime: "04:15 PM" }, return: { route: "Station to CUET", departureTime: "08:45 PM" } },
};
const PASSENGER_GROUPS = ["ALL_STUDENTS", "FEMALE_STUDENTS", "ALL_TEACHERS", "ALL_STAFF", "ALL_USERS"];
const GROUP_LABELS = { ALL_STUDENTS: "All Students", FEMALE_STUDENTS: "Female Students", ALL_TEACHERS: "All Teachers", ALL_STAFF: "All Staff", ALL_USERS: "All Passengers" };

function eligibleGroups(user) {
  if (user?.userType === "STUDENT") return user.gender === "FEMALE" ? ["ALL_STUDENTS", "FEMALE_STUDENTS", "ALL_USERS"] : ["ALL_STUDENTS", "ALL_USERS"];
  if (user?.userType === "TEACHER") return ["ALL_TEACHERS", "ALL_USERS"];
  if (user?.userType === "STAFF") return ["ALL_STAFF", "ALL_USERS"];
  return [];
}

function transportError(error, operation, code = "TRANSPORT_ERROR") {
  if (["42P01", "42703", "PGRST205", "PGRST204"].includes(error?.code)) {
    return new AppError(503, "Daily assignments are not available in Supabase yet. Apply migrations 004_daily_shift_assignments.sql and 005_driver_access_without_approval.sql, then reload the schema.", "ASSIGNMENT_SCHEMA_OUTDATED");
  }
  if (error?.message === "TICKET_LIMIT_REACHED" || (error?.code === "23505" && error?.message?.includes("reservations_one_ticket_per_departure_idx"))) {
    return new AppError(409, "You have already booked a ticket for this departure.", "TICKET_LIMIT_REACHED");
  }
  if (error?.code === "23505") return new AppError(409, "That seat or unique transport value is already in use.", "TRANSPORT_CONFLICT");
  if (error?.code === "23P01") return new AppError(409, error.message || "The selected Driver or bus already has an overlapping assignment.", "ASSIGNMENT_CONFLICT");
  if (error?.code === "23503") return new AppError(409, "This record is still referenced by active transport data.", "TRANSPORT_IN_USE");
  if (error?.code === "42501") return new AppError(403, error.message || "Transport access is forbidden.", "TRANSPORT_FORBIDDEN");
  if (["22000", "22007"].includes(error?.code)) return new AppError(409, error.message || "Transport state conflict.", "TRANSPORT_STATE_CONFLICT");
  if (error?.code === "P0002") return new AppError(404, error.message || "Transport record not found.", "TRANSPORT_NOT_FOUND");
  return new AppError(500, `Unable to ${operation}.`, code, { databaseMessage: error?.message });
}

function id(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function serviceDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function scheduleDate(value) {
  if (value === undefined || value === null || value === "") return serviceDate();
  const date = String(value);
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new AppError(400, "Service date is invalid.", "INVALID_SERVICE_DATE");
  }
  return date;
}

function value(object, snake, camel = snake) {
  return object?.[snake] ?? object?.[camel];
}

export function serializeBus(row, reservedCount = 0) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    number: row.number,
    type: row.category,
    capacity: row.capacity,
    route: row.route,
    stops: row.stops || [],
    departureTime: row.departure_time,
    arrivalTime: row.arrival_time,
    availableSeats: Math.max(0, row.capacity - reservedCount),
    status: row.status,
    nextStop: row.next_stop,
    eta: `${row.eta_minutes || 0} min`,
    currentLocation: {
      label: row.location_label || "Transport Yard",
      lat: row.latitude,
      lng: row.longitude,
    },
    assignedDriver: row.assigned_driver_name || "Unassigned",
  };
}

export function serializeTrip(row) {
  const bus = Array.isArray(row.buses) ? row.buses[0] : row.buses;
  return {
    id: row.id,
    busId: row.bus_id,
    busName: bus?.name,
    busNumber: bus?.number,
    busCategory: bus?.category,
    capacity: bus?.capacity,
    route: row.route,
    stops: row.stops || [],
    departureTime: row.departure_time,
    arrivalTime: row.arrival_time,
    status: row.status,
    driver: bus?.assigned_driver_name,
    assignmentId: row.assignment_id,
    serviceDate: row.service_date,
    shift: row.shift,
    passengerGroup: row.passenger_group,
    passengerGroupLabel: GROUP_LABELS[row.passenger_group],
    direction: row.direction,
    reservationStatus: row.reservation_status,
    operationalStatus: row.operational_status,
  };
}

export function serializeReservation(row) {
  if (!row) return null;
  return {
    id: row.id,
    bookingId: row.id,
    ticketId: row.ticket_id,
    userId: row.profile_id,
    passengerName: row.passenger_name,
    email: row.passenger_email,
    roleLabel: row.role_label,
    tripId: row.trip_id,
    busId: row.bus_id,
    busName: row.bus_name,
    busNumber: row.bus_number,
    busCategory: row.bus_category,
    route: row.route,
    date: row.travel_date,
    departureTime: row.departure_time,
    arrivalTime: row.arrival_time,
    seatNumber: row.seat_number,
    status: row.status,
    boardingStatus: row.boarding_status,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at,
    universityId: row.university_id,
  };
}

function serializeTicket(row) {
  const reservation = Array.isArray(row.reservations) ? row.reservations[0] : row.reservations;
  const invoice = reservation ? (Array.isArray(reservation.invoices) ? reservation.invoices[0] : reservation.invoices) : null;
  return {
    ...serializeReservation(reservation),
    id: row.id,
    ticketId: row.id,
    status: row.status,
    qrPayload: row.qr_payload,
    usedAt: row.used_at,
    invoice: invoice ? {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      issueDate: invoice.issue_date,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      fees: invoice.fees,
      discount: invoice.discount,
      total: invoice.total,
      currency: invoice.currency,
      paymentStatus: invoice.payment_status
    } : null
  };
}

function serializeNotification(row, user) {
  return {
    id: row.id,
    userId: row.profile_id,
    role: user?.role,
    type: row.type,
    title: row.title,
    message: row.message,
    tone: row.tone,
    unread: row.unread,
    time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(row.created_at)),
    createdAt: row.created_at,
  };
}

async function reservationCounts(date = serviceDate()) {
  const { data, error } = await getSupabaseAdmin().from("reservations").select("bus_id")
    .eq("travel_date", date).neq("status", "Cancelled");
  if (error) throw transportError(error, "count active reservations");
  return (data || []).reduce((counts, item) => counts.set(item.bus_id, (counts.get(item.bus_id) || 0) + 1), new Map());
}

export async function listBuses(user, busId, date) {
  const targetDate = scheduleDate(date);
  const groups = eligibleGroups(user);
  if (!groups.length) return busId ? null : [];
  let query = getSupabaseAdmin().from("transport_assignments").select("*, buses(*), transport_trips(*)")
    .eq("service_date", targetDate).eq("status", "ACTIVE").in("passenger_group", groups).order("shift");
  if (busId) query = query.eq("bus_id", busId);
  const [{ data, error }, counts] = await Promise.all([query, reservationCounts(targetDate)]);
  if (error) throw transportError(error, "read buses");
  const buses = (data || []).map((assignment) => {
    const bus = assignment.buses;
    const outbound = (assignment.transport_trips || []).find((trip) => trip.direction === "OUTBOUND") || assignment.transport_trips?.[0];
    return { ...serializeBus(bus, counts.get(bus.id) || 0), route: outbound?.route || bus.route, departureTime: outbound?.departure_time || bus.departure_time, assignmentId: assignment.id, shift: assignment.shift, passengerGroup: assignment.passenger_group, passengerGroupLabel: GROUP_LABELS[assignment.passenger_group] };
  });
  return busId ? buses[0] || null : buses;
}

export async function listRoutes() {
  const { data, error } = await getSupabaseAdmin().from("transport_routes").select("*").order("id");
  if (error) throw transportError(error, "read routes");
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    start: row.start_point,
    destination: row.destination,
    stops: row.stops || [],
    assignedBusIds: row.assigned_bus_ids || [],
    estimatedMinutes: row.estimated_minutes,
  }));
}

export async function listTrips(user, date) {
  const targetDate = scheduleDate(date);
  const groups = eligibleGroups(user);
  if (!groups.length) return [];
  const { data, error } = await getSupabaseAdmin().from("transport_trips").select("*, buses(*), transport_assignments!inner(status)")
    .eq("service_date", targetDate).eq("transport_assignments.status", "ACTIVE").in("passenger_group", groups).order("departure_time");
  if (error) throw transportError(error, "read trips");
  return (data || []).map(serializeTrip);
}

export async function listReservations(profileId, { all = false } = {}) {
  let query = getSupabaseAdmin().from("reservations").select("*").order("created_at", { ascending: false });
  if (!all) query = query.eq("profile_id", profileId);
  const { data, error } = await query;
  if (error) throw transportError(error, "read reservations");
  return (data || []).map(serializeReservation);
}

export async function reservedSeats(user, tripId, travelDate) {
  const trip = (await listTrips(user, travelDate)).find((item) => item.id === tripId && item.serviceDate === travelDate);
  if (!trip) throw new AppError(403, "This trip is unavailable to your profile.", "TRIP_FORBIDDEN");
  const { data, error } = await getSupabaseAdmin().from("reservations").select("seat_number")
    .eq("trip_id", tripId).eq("travel_date", travelDate).neq("status", "Cancelled");
  if (error) throw transportError(error, "read reserved seats");
  return (data || []).map((row) => row.seat_number);
}

export async function reserveSeat(profileId, input) {
  const { data, error } = await getSupabaseAdmin().rpc("reserve_transport_seat", {
    p_profile_id: profileId,
    p_trip_id: input.tripId,
    p_travel_date: input.date,
    p_seat_number: input.seatNumber,
  });
  if (error) throw transportError(error, "create reservation");
  const reservation = serializeReservation(data.reservation);
  return {
    reservation,
    ticket: {
      ...reservation,
      id: data.ticket.id,
      ticketId: data.ticket.id,
      status: data.ticket.status,
      qrPayload: data.ticket.qr_payload,
    },
  };
}

export async function cancelReservation(profileId, bookingId) {
  const { data, error } = await getSupabaseAdmin().rpc("cancel_transport_reservation", {
    p_profile_id: profileId,
    p_booking_id: bookingId,
  });
  if (error) throw transportError(error, "cancel reservation");
  return serializeReservation(data);
}

function ticketIsEligible(row, user) {
  const reservation = Array.isArray(row.reservations) ? row.reservations[0] : row.reservations;
  const trip = reservation?.transport_trips;
  const assignment = trip?.transport_assignments;
  return !assignment || (assignment.status === "ACTIVE" && eligibleGroups(user).includes(assignment.passenger_group));
}

export async function listTickets(user) {
  const { data, error } = await getSupabaseAdmin().from("tickets").select("*, reservations(*, transport_trips(*, transport_assignments(*)), invoices(*))")
    .eq("profile_id", user.profileId).order("created_at", { ascending: false });
  if (error) throw transportError(error, "read tickets");
  return (data || []).filter((row) => ticketIsEligible(row, user)).map(serializeTicket);
}

export async function getTicket(user, ticketId) {
  const { data, error } = await getSupabaseAdmin().from("tickets").select("*, reservations(*, transport_trips(*, transport_assignments(*)), invoices(*))")
    .eq("profile_id", user.profileId).eq("id", ticketId).maybeSingle();
  if (error) throw transportError(error, "read ticket");
  return data && ticketIsEligible(data, user) ? serializeTicket(data) : null;
}

export async function listTracking(user, busId) {
  const [visibleBuses, { data, error }, counts] = await Promise.all([
    user?.userType === "TRANSPORT_ADMIN" ? adminBuses() : listBuses(user),
    getSupabaseAdmin().from("tracking_positions").select("*, buses(*)").order("bus_id"),
    reservationCounts(),
  ]);
  if (error) throw transportError(error, "read live tracking");
  const visibleIds = new Set(visibleBuses.map((bus) => bus.id));
  const rows = (data || []).filter((row) => visibleIds.has(row.bus_id) && (!busId || row.bus_id === busId));
  return rows.map((row) => ({
    id: row.bus_id,
    name: row.buses?.name,
    busNumber: row.buses?.number,
    category: row.buses?.category,
    route: row.buses?.route,
    stops: row.buses?.stops || [],
    currentLocation: { label: row.location_label, lat: row.latitude, lng: row.longitude },
    nextStop: row.next_stop,
    etaMinutes: row.eta_minutes,
    speed: row.speed,
    status: row.status,
    delayMinutes: row.delay_minutes,
    assignedDriver: row.buses?.assigned_driver_name,
    capacity: row.buses?.capacity,
    availableSeats: Math.max(0, (row.buses?.capacity || 0) - (counts.get(row.bus_id) || 0)),
    progress: row.progress,
    updatedAt: row.updated_at,
  }));
}

export async function listNotifications(user) {
  const { data, error } = await getSupabaseAdmin().from("notifications").select("*")
    .eq("profile_id", user.profileId).order("created_at", { ascending: false });
  if (error) throw transportError(error, "read notifications");
  return (data || []).map((row) => serializeNotification(row, user));
}

export async function markNotification(user, notificationId) {
  let query = getSupabaseAdmin().from("notifications").update({ unread: false }).eq("profile_id", user.profileId);
  if (notificationId) query = query.eq("id", notificationId);
  const { error } = await query;
  if (error) throw transportError(error, "update notifications");
  return listNotifications(user);
}

export async function clearNotifications(user) {
  const { error } = await getSupabaseAdmin().from("notifications").delete().eq("profile_id", user.profileId);
  if (error) throw transportError(error, "clear notifications");
  return [];
}

async function assignedBusForDriver(user) {
  const admin = getSupabaseAdmin();
  const { data: assignment, error } = await admin.from("driver_assignments").select("*, buses(*)")
    .eq("driver_profile_id", user.profileId).maybeSingle();
  if (error) throw transportError(error, "read Driver assignment");
  if (assignment?.buses) return assignment.buses;
  const { data: matched, error: matchError } = await admin.from("buses").select("*").ilike("assigned_driver_name", user.name).limit(1).maybeSingle();
  if (matchError) throw transportError(matchError, "match Driver assignment");
  return matched;
}

export async function driverTrips(user) {
  const { data, error } = await getSupabaseAdmin().from("transport_trips").select("*, buses(*)").eq("driver_profile_id", user.profileId).eq("service_date", serviceDate()).order("departure_time");
  if (error) throw transportError(error, "read assigned trips");
  return (data || []).map((row, index) => ({
    ...serializeTrip(row),
    date: row.service_date,
    status: ["Boarding", "In Progress", "Completed", "Cancelled"].includes(row.status) ? row.status : index === 0 ? "Boarding" : "Upcoming",
    currentLocation: row.buses?.location_label,
    nextStop: row.buses?.next_stop,
    eta: `${row.buses?.eta_minutes || 0} min`,
  }));
}

export async function passengerManifest(user, tripId) {
  const trips = await driverTrips(user);
  if (!trips.some((trip) => trip.id === tripId)) throw new AppError(403, "This trip is not assigned to the current Driver.", "TRIP_NOT_ASSIGNED");
  const { data, error } = await getSupabaseAdmin().from("reservations").select("*").eq("trip_id", tripId)
    .eq("travel_date", serviceDate()).order("seat_number");
  if (error) throw transportError(error, "read passenger manifest");
  return (data || []).map((row) => ({ ...serializeReservation(row), id: row.ticket_id }));
}

export async function tripSummary(user, tripId) {
  const trip = (await driverTrips(user)).find((item) => item.id === tripId);
  if (!trip) throw new AppError(404, "Assigned trip not found.", "TRIP_NOT_FOUND");
  const passengers = await passengerManifest(user, tripId);
  const active = passengers.filter((item) => item.boardingStatus !== "Cancelled");
  const boarded = active.filter((item) => item.boardingStatus === "Boarded").length;
  return { trip, passengerCount: active.length, boarded, waiting: active.length - boarded, capacity: trip.capacity };
}

export async function updateDriverTrip(user, tripId, status) {
  const assigned = await driverTrips(user);
  if (!assigned.some((trip) => trip.id === tripId)) throw new AppError(403, "This trip is not assigned to the current Driver.", "TRIP_NOT_ASSIGNED");
  const operationalStatus = status === "In Progress" ? "IN_PROGRESS" : status.toUpperCase().replaceAll(" ", "_");
  const { data, error } = await getSupabaseAdmin().from("transport_trips").update({ status, operational_status: operationalStatus, ...( ["Completed", "Cancelled"].includes(status) ? { reservation_status: "CLOSED" } : {}) }).eq("id", tripId).select("*, buses(*)").single();
  if (error) throw transportError(error, "update trip status");
  await getSupabaseAdmin().from("tracking_positions").update({
    status: status === "In Progress" ? "Running" : status,
    ...(status === "Completed" ? { speed: 0, eta_minutes: 0 } : {}),
  }).eq("bus_id", data.bus_id);
  return { ...serializeTrip(data), date: serviceDate(), status };
}

export async function updateDriverLocation(user, input) {
  const trip = (await driverTrips(user)).find((item) => item.id === input.tripId);
  if (!trip) throw new AppError(403, "This trip is not assigned to the current Driver.", "TRIP_NOT_ASSIGNED");
  const row = {
    bus_id: trip.busId,
    latitude: Number(input.latitude),
    longitude: Number(input.longitude),
    location_label: input.locationLabel || "Live GPS position",
    next_stop: input.nextStop || null,
    eta_minutes: Math.max(0, Number(input.etaMinutes || 0)),
    speed: Math.max(0, Math.round(Number(input.speed || 0))),
    status: input.status || "Running",
    delay_minutes: Math.max(0, Number(input.delayMinutes || 0)),
    progress: Math.min(1, Math.max(0, Number(input.progress || 0))),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await getSupabaseAdmin().from("tracking_positions").upsert(row).select("*").single();
  if (error) throw transportError(error, "publish live location");
  return data;
}

export async function verifyDriverTicket(user, ticketId, tripId) {
  let finalTicketId = ticketId.trim().toUpperCase();
  if (!finalTicketId.startsWith("TKT-")) finalTicketId = `TKT-${finalTicketId}`;

  const { data, error } = await getSupabaseAdmin().rpc("verify_transport_ticket", {
    p_driver_profile_id: user.profileId,
    p_ticket_id: finalTicketId,
    p_trip_id: tripId,
  });
  if (error) throw transportError(error, "verify ticket");
  return {
    ...serializeReservation(data.reservation),
    id: data.ticket.id,
    ticketId: data.ticket.id,
    qrPayload: data.ticket.qr_payload,
    status: "Verified",
    boardingStatus: "Boarded",
  };
}

export async function createDriverReport(user, reportType, input) {
  const { data, error } = await getSupabaseAdmin().from("driver_reports").insert({
    id: id(reportType === "CONDITION" ? "COND" : reportType === "DELAY" ? "DLY" : "SOS"),
    driver_profile_id: user.profileId,
    bus_id: input.busId || null,
    trip_id: input.tripId || null,
    report_type: reportType,
    payload: input,
    status: "Sent",
  }).select("*").single();
  if (error) throw transportError(error, "submit Driver report");
  return { ...data.payload, id: data.id, driverId: user.profileId, createdAt: data.created_at, status: data.status };
}

export async function adminBuses() {
  const [{ data, error }, counts] = await Promise.all([
    getSupabaseAdmin().from("buses").select("*").order("name"),
    reservationCounts(),
  ]);
  if (error) throw transportError(error, "read fleet buses");
  return (data || []).map((bus) => serializeBus(bus, counts.get(bus.id) || 0));
}

export function validateAdminBusInput(input, existing = {}) {
  const name = String(input.name || existing.name || "").trim();
  const number = String(input.number || existing.number || "").trim();
  const category = String(input.type || existing.category || "").trim();
  const route = String(input.route || existing.route || "").trim();
  const capacity = Number(input.capacity ?? existing.capacity);
  const allowedCategories = ["Student Bus", "Female Student Bus", "Teacher Bus", "Staff Bus"];
  const allowedStatuses = ["On Time", "Boarding", "En Route", "Delayed", "Arrived", "Under Maintenance"];
  if (!name || !number || !route) throw new AppError(400, "Bus name, number, and route are required.", "BUS_VALIDATION_ERROR");
  if (!allowedCategories.includes(category)) throw new AppError(400, "Bus category is invalid.", "INVALID_BUS_CATEGORY");
  if (!Number.isInteger(capacity) || capacity < 10 || capacity > 200) throw new AppError(400, "Bus capacity must be between 10 and 200.", "INVALID_BUS_CAPACITY");
  const routeParts = route.split(" - ").map((item) => item.trim()).filter(Boolean);
  if (routeParts.length < 2) throw new AppError(400, "Route must include a start and destination separated by a hyphen.", "INVALID_BUS_ROUTE");
  const status = input.status || existing.status || "On Time";
  if (!allowedStatuses.includes(status)) throw new AppError(400, "Bus status is invalid.", "INVALID_BUS_STATUS");
  return {
    id: input.id || existing.id || id("BUS"),
    name,
    number,
    category,
    capacity,
    route,
    stops: input.stops?.length ? input.stops : existing.stops || routeParts,
    departure_time: input.departureTime || existing.departure_time || "07:30 AM",
    arrival_time: input.arrivalTime || existing.arrival_time || "08:20 AM",
    status,
    next_stop: input.nextStop || existing.next_stop || routeParts.at(-1),
    eta_minutes: Number.parseInt(input.eta || existing.eta_minutes || 10, 10),
    location_label: input.currentLocation?.label || existing.location_label || "Transport Yard",
    latitude: input.currentLocation?.lat ?? existing.latitude ?? 23.75,
    longitude: input.currentLocation?.lng ?? existing.longitude ?? 90.4,
    assigned_driver_name: input.assignedDriver || existing.assigned_driver_name || null,
  };
}

export async function saveAdminBus(input) {
  const admin = getSupabaseAdmin();
  const existingResult = input.id ? await admin.from("buses").select("*").eq("id", input.id).maybeSingle() : { data: null, error: null };
  if (existingResult.error) throw transportError(existingResult.error, "read bus");
  if (input.id && !existingResult.data) throw new AppError(404, "Bus not found.", "BUS_NOT_FOUND");
  const row = validateAdminBusInput(input, existingResult.data || {});
  const { data, error } = await admin.from("buses").upsert(row).select("*").single();
  if (error) throw transportError(error, "save bus");
  await admin.from("tracking_positions").upsert({
    bus_id: data.id, location_label: data.location_label, latitude: data.latitude, longitude: data.longitude,
    next_stop: data.next_stop, eta_minutes: data.eta_minutes, status: data.status,
  });
  return serializeBus(data);
}

export async function deleteAdminBus(busId) {
  const { error } = await getSupabaseAdmin().from("buses").delete().eq("id", busId);
  if (error) throw transportError(error, "delete bus");
  return true;
}

export async function saveAdminRoute(input) {
  const row = {
    id: input.id || id("RTE"), name: input.name, start_point: input.start, destination: input.destination,
    stops: input.stops || [], assigned_bus_ids: input.assignedBusIds || [], estimated_minutes: Number(input.estimatedMinutes),
  };
  const { data, error } = await getSupabaseAdmin().from("transport_routes").upsert(row).select("*").single();
  if (error) throw transportError(error, "save route");
  return { id: data.id, name: data.name, start: data.start_point, destination: data.destination, stops: data.stops, assignedBusIds: data.assigned_bus_ids, estimatedMinutes: data.estimated_minutes };
}

export async function deleteAdminRoute(routeId) {
  const { error } = await getSupabaseAdmin().from("transport_routes").delete().eq("id", routeId);
  if (error) throw transportError(error, "delete route");
  return true;
}

function serializeSchedule(row) {
  const bus = Array.isArray(row.buses) ? row.buses[0] : row.buses;
  return { id: row.id, tripId: row.trip_id, busId: row.bus_id, busName: bus?.name, route: bus?.route, date: row.service_date, departureTime: row.departure_time, arrivalTime: row.arrival_time, busCategory: bus?.category, scheduleType: row.schedule_type, status: row.status };
}

export async function adminSchedules() {
  const { data, error } = await getSupabaseAdmin().from("transport_schedules").select("*, buses(*)").order("service_date");
  if (error) throw transportError(error, "read schedules");
  return (data || []).map(serializeSchedule);
}

export async function saveAdminSchedule(input) {
  const admin = getSupabaseAdmin();
  const scheduleId = input.id || id("SCH");
  const tripId = input.tripId || `${scheduleId}-TRIP`;
  const { data: bus, error: busError } = await admin.from("buses").select("*").eq("id", input.busId).single();
  if (busError) throw transportError(busError, "read the scheduled bus");
  const { error: tripError } = await admin.from("transport_trips").upsert({
    id: tripId,
    bus_id: input.busId,
    route: input.route || bus.route,
    stops: bus.stops,
    departure_time: input.departureTime,
    arrival_time: input.arrivalTime,
    status: input.status || "Scheduled",
  });
  if (tripError) throw transportError(tripError, "publish scheduled trip");
  const row = { id: scheduleId, trip_id: tripId, bus_id: input.busId, service_date: input.date, departure_time: input.departureTime, arrival_time: input.arrivalTime, schedule_type: input.scheduleType, status: input.status || "Scheduled" };
  const { data, error } = await admin.from("transport_schedules").upsert(row).select("*, buses(*)").single();
  if (error) throw transportError(error, "save schedule");
  return serializeSchedule(data);
}

export async function deleteAdminSchedule(scheduleId) {
  const { error } = await getSupabaseAdmin().from("transport_schedules").delete().eq("id", scheduleId);
  if (error) throw transportError(error, "delete schedule");
  return true;
}

export function normalizeDriverEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError(400, "A valid Driver email is required.", "INVALID_DRIVER_EMAIL");
  return email;
}

function assignmentInput(input) {
  const serviceDateValue = String(input.serviceDate || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDateValue)) throw new AppError(400, "A valid service date is required.", "INVALID_SERVICE_DATE");
  if (!SHIFT_DEFINITIONS[input.shift]) throw new AppError(400, "A valid daily shift is required.", "INVALID_SHIFT");
  if (!PASSENGER_GROUPS.includes(input.passengerGroup)) throw new AppError(400, "A valid passenger group is required.", "INVALID_PASSENGER_GROUP");
  if (!String(input.busName || "").trim() || !String(input.busNumber || "").trim()) throw new AppError(400, "Bus name and bus number are required.", "VALIDATION_ERROR");
  return { serviceDate: serviceDateValue, shift: input.shift, passengerGroup: input.passengerGroup, busName: input.busName.trim(), busNumber: input.busNumber.trim(), driverEmail: normalizeDriverEmail(input.driverEmail), status: input.status || "ACTIVE" };
}

function assignmentStops(route) { return route.split(" to "); }
function assignmentTrip(idValue, assignment, bus, driver, direction) {
  const definition = SHIFT_DEFINITIONS[assignment.shift][direction === "OUTBOUND" ? "outbound" : "return"];
  return { id: `${idValue}-${direction}`, assignment_id: idValue, bus_id: bus.id, driver_profile_id: driver.id, service_date: assignment.serviceDate, shift: assignment.shift, passenger_group: assignment.passengerGroup, direction, route: definition.route, stops: assignmentStops(definition.route), departure_time: definition.departureTime, arrival_time: definition.departureTime, status: "Scheduled", reservation_status: assignment.status === "ACTIVE" ? "OPEN" : "CLOSED", operational_status: assignment.status === "ACTIVE" ? "SCHEDULED" : assignment.status };
}

export function validateDriverForAssignment(driver) {
  if (!driver) throw new AppError(404, "No registered account was found for this Driver email.", "DRIVER_EMAIL_NOT_FOUND");
  if (driver.user_type !== "DRIVER") throw new AppError(400, "The registered email belongs to a non-Driver account.", "NOT_A_DRIVER");
  if (!driver.is_verified) throw new AppError(409, "The Driver must verify their email before receiving an assignment.", "DRIVER_NOT_VERIFIED");
  if (!driver.is_active) throw new AppError(409, "An inactive Driver cannot receive an assignment.", "DRIVER_INACTIVE");
  return driver;
}

export async function adminAssignments() {
  const { data, error } = await getSupabaseAdmin().from("transport_assignments").select("*, buses(*), profiles!transport_assignments_driver_profile_id_fkey(full_name,email), transport_trips(*)").order("service_date", { ascending: false }).order("shift");
  if (error) throw transportError(error, "read assignments");
  return (data || []).map((row) => ({ id: row.id, serviceDate: row.service_date, shift: row.shift, passengerGroup: row.passenger_group, passengerGroupLabel: GROUP_LABELS[row.passenger_group], status: row.status, busId: row.bus_id, busName: row.buses?.name, busNumber: row.buses?.number, driverEmail: row.profiles?.email, driverName: row.profiles?.full_name, trips: (row.transport_trips || []).map(serializeTrip) }));
}

export async function saveAdminAssignment(input) {
  const assignment = assignmentInput(input); const admin = getSupabaseAdmin();
  if (input.id) {
    const { data: current, error: currentError } = await admin.from("transport_assignments").select("passenger_group").eq("id", input.id).maybeSingle();
    if (currentError) throw transportError(currentError, "read assignment");
    if (current && current.passenger_group !== assignment.passengerGroup) {
      const { data: tripRows, error: tripLookupError } = await admin.from("transport_trips").select("id").eq("assignment_id", input.id);
      if (tripLookupError) throw transportError(tripLookupError, "check assignment trips");
      const { count, error: reservationError } = await admin.from("reservations").select("id", { count: "exact", head: true }).in("trip_id", (tripRows || []).map((row) => row.id)).neq("status", "Cancelled");
      if (reservationError) throw transportError(reservationError, "check affected reservations");
      if (count) throw new AppError(409, "Resolve affected active reservations before changing the passenger group.", "ASSIGNMENT_RESOLUTION_REQUIRED");
    }
  }
  const { data: driver, error: driverError } = await admin.from("profiles").select("*").ilike("email", assignment.driverEmail).maybeSingle();
  if (driverError) throw transportError(driverError, "validate Driver");
  validateDriverForAssignment(driver);
  const { data: existingBus, error: busError } = await admin.from("buses").select("*").eq("number", assignment.busNumber).maybeSingle();
  if (busError) throw transportError(busError, "validate bus");
  if (existingBus && existingBus.name !== assignment.busName) throw new AppError(409, "Bus number is already registered to a different bus.", "BUS_NUMBER_CONFLICT");
  let bus = existingBus;
  if (!bus) {
    const { data: createdBus, error: createBusError } = await admin.from("buses").insert({ id: id("BUS"), name: assignment.busName, number: assignment.busNumber, category: "Student Bus", capacity: Number(input.capacity || 40), route: SHIFT_DEFINITIONS[assignment.shift].outbound.route, stops: assignmentStops(SHIFT_DEFINITIONS[assignment.shift].outbound.route), departure_time: SHIFT_DEFINITIONS[assignment.shift].outbound.departureTime, arrival_time: SHIFT_DEFINITIONS[assignment.shift].outbound.departureTime, status: "On Time" }).select("*").single();
    if (createBusError) throw transportError(createBusError, "create the assigned bus", "BUS_CREATE_FAILED");
    bus = createdBus;
  }
  const assignmentId = input.id || id("ASN");
  const { data, error } = await admin.from("transport_assignments").upsert({ id: assignmentId, service_date: assignment.serviceDate, shift: assignment.shift, passenger_group: assignment.passengerGroup, bus_id: bus.id, driver_profile_id: driver.id, status: assignment.status }).select("*").single();
  if (error) throw transportError(error, "save assignment");
  const trips = [assignmentTrip(assignmentId, assignment, bus, driver, "OUTBOUND"), assignmentTrip(assignmentId, assignment, bus, driver, "RETURN")];
  const { error: tripError } = await admin.from("transport_trips").upsert(trips);
  if (tripError) throw transportError(tripError, "create assignment trips");
  const { error: notificationError } = await admin.from("notifications").insert({ id: id("NTF"), profile_id: driver.id, type: "assignment", title: "Daily bus assignment", message: `${assignment.serviceDate}: ${assignment.shift} / ${GROUP_LABELS[assignment.passengerGroup]} / ${assignment.busName} (${assignment.busNumber})`, tone: "info" });
  if (notificationError) throw transportError(notificationError, "notify the assigned Driver");
  return { id: data.id, serviceDate: data.service_date, shift: data.shift, passengerGroup: data.passenger_group, passengerGroupLabel: GROUP_LABELS[data.passenger_group], status: data.status, busId: bus.id, busName: bus.name, busNumber: bus.number, driverEmail: driver.email, driverName: driver.full_name, trips: trips.map((trip) => serializeTrip({ ...trip, buses: bus })) };
}

export async function cancelAdminAssignment(assignmentId) {
  const admin = getSupabaseAdmin();
  const { data: reservations, error: reservationError } = await admin.from("reservations").select("id").in("trip_id", (await admin.from("transport_trips").select("id").eq("assignment_id", assignmentId)).data?.map((row) => row.id) || []).neq("status", "Cancelled");
  if (reservationError) throw transportError(reservationError, "check assignment reservations");
  if (reservations?.length) throw new AppError(409, "Cancel affected reservations before cancelling this assignment.", "ASSIGNMENT_RESOLUTION_REQUIRED");
  const { error } = await admin.from("transport_assignments").update({ status: "CANCELLED" }).eq("id", assignmentId);
  if (error) throw transportError(error, "cancel assignment");
  const { error: tripError } = await admin.from("transport_trips").update({ reservation_status: "CLOSED", operational_status: "CANCELLED", status: "Cancelled" }).eq("assignment_id", assignmentId);
  if (tripError) throw transportError(tripError, "cancel assignment trips");
  return true;
}

export async function adminUsers() {
  const { data, error } = await getSupabaseAdmin().from("profiles").select("*").order("full_name");
  if (error) throw transportError(error, "read users");
  return (data || []).map((row) => ({ id: row.id, name: row.full_name, universityId: row.institutional_id || row.student_id || row.id, role: ROLE_LABELS[row.user_type], email: row.email, status: row.is_active ? "Active" : "Inactive" }));
}

export async function updateAdminUser(profileId, updates) {
  if (updates.role) throw new AppError(400, "Identity roles cannot be changed from transport management.", "ROLE_CHANGE_UNSAFE");
  const values = {};
  if (updates.status) values.is_active = updates.status === "Active";
  const { data, error } = await getSupabaseAdmin().from("profiles").update(values).eq("id", profileId).select("*").single();
  if (error) throw transportError(error, "update user");
  return { id: data.id, name: data.full_name, universityId: data.institutional_id || data.student_id || data.id, role: ROLE_LABELS[data.user_type], email: data.email, status: data.is_active ? "Active" : "Inactive" };
}

export async function adminDrivers() {
  const { data, error } = await getSupabaseAdmin().from("profiles").select("*, driver_assignments(*, buses(*))").eq("user_type", "DRIVER").order("full_name");
  if (error) throw transportError(error, "read Drivers");
  return (data || []).map((profile) => {
    const assignment = Array.isArray(profile.driver_assignments) ? profile.driver_assignments[0] : profile.driver_assignments;
    return { id: profile.id, name: profile.full_name, assignedBusId: assignment?.bus_id || "", assignedBus: assignment?.buses?.name || "Unassigned", contact: profile.phone, status: assignment?.status || (profile.is_active ? "Available" : "Suspended"), completedTrips: assignment?.completed_trips || 0 };
  });
}

export async function updateAdminDriver(profileId, updates) {
  const { data, error } = await getSupabaseAdmin().from("driver_assignments").upsert({ driver_profile_id: profileId, ...(updates.assignedBusId !== undefined ? { bus_id: updates.assignedBusId || null } : {}), ...(updates.status ? { status: updates.status } : {}) }).select("*").single();
  if (error) throw transportError(error, "update Driver");
  return data;
}

export async function maintenanceRecords() {
  const { data, error } = await getSupabaseAdmin().from("maintenance_records").select("*, buses(name)").order("id");
  if (error) throw transportError(error, "read maintenance records");
  return (data || []).map((row) => ({ id: row.id, busId: row.bus_id, busName: row.buses?.name, condition: row.condition, lastMaintenance: row.last_maintenance, nextMaintenance: row.next_maintenance, reportedIssue: row.reported_issue, status: row.status }));
}

export async function updateMaintenance(recordId, updates) {
  const values = {};
  if (updates.condition !== undefined) values.condition = updates.condition;
  if (updates.status !== undefined) values.status = updates.status;
  if (updates.reportedIssue !== undefined) values.reported_issue = updates.reportedIssue;
  if (updates.lastMaintenance !== undefined) values.last_maintenance = updates.lastMaintenance;
  if (updates.nextMaintenance !== undefined) values.next_maintenance = updates.nextMaintenance;
  const { data, error } = await getSupabaseAdmin().from("maintenance_records").update(values).eq("id", recordId).select("*, buses(name)").single();
  if (error) throw transportError(error, "update maintenance record");
  return { id: data.id, busId: data.bus_id, busName: data.buses?.name, condition: data.condition, lastMaintenance: data.last_maintenance, nextMaintenance: data.next_maintenance, reportedIssue: data.reported_issue, status: data.status };
}

export async function operationalAlerts() {
  const { data, error } = await getSupabaseAdmin().from("driver_reports").select("*").order("created_at", { ascending: false });
  if (error) throw transportError(error, "read operational alerts");
  const mapped = (data || []).map((row) => ({ ...row.payload, id: row.id, driverId: row.driver_profile_id, createdAt: row.created_at, status: row.status }));
  return {
    conditions: mapped.filter((_, index) => data[index].report_type === "CONDITION"),
    delays: mapped.filter((_, index) => data[index].report_type === "DELAY"),
    emergencies: mapped.filter((_, index) => data[index].report_type === "EMERGENCY"),
  };
}

export async function adminOverview() {
  const [buses, schedules, reservations, maintenance, alerts] = await Promise.all([adminBuses(), adminSchedules(), listReservations(null, { all: true }), maintenanceRecords(), operationalAlerts()]);
  const today = serviceDate();
  return { buses, schedules, reservations, maintenance, alerts, stats: {
    totalBuses: buses.length,
    activeBuses: buses.filter((bus) => !["Arrived", "Under Maintenance"].includes(bus.status)).length,
    todayTrips: schedules.filter((item) => item.date === today).length,
    totalReservations: reservations.filter((item) => item.status !== "Cancelled").length,
    availableSeats: buses.reduce((sum, bus) => sum + Number(bus.availableSeats || 0), 0),
    delayedBuses: schedules.filter((item) => item.status === "Delayed").length,
    maintenanceBuses: maintenance.filter((item) => item.status === "Under Maintenance").length,
    emergencyReports: alerts.emergencies.length,
  } };
}

export async function adminAnalytics() {
  const reservations = await listReservations(null, { all: true });
  const active = reservations.filter((item) => item.status !== "Cancelled");
  const byRole = active.reduce((result, item) => ({ ...result, [item.roleLabel]: (result[item.roleLabel] || 0) + 1 }), {});
  const total = Math.max(1, active.length);
  return {
    daily: [0, 0, 0, 0, 0, 0, active.length],
    weekly: [active.length, active.length, active.length, active.length],
    occupancy: ["Student", "Female Student", "Teacher", "Staff"].map((label) => ({ label, value: Math.round(((byRole[label] || 0) / total) * 100) })),
    routes: [], peakHours: [],
    cancellationRate: Math.round((reservations.filter((item) => item.status === "Cancelled").length / Math.max(1, reservations.length)) * 1000) / 10,
    noShowRate: Math.round((active.filter((item) => item.boardingStatus === "Not Boarded").length / total) * 1000) / 10,
    utilization: Math.round((active.length / Math.max(1, (await adminBuses()).reduce((sum, bus) => sum + bus.capacity, 0))) * 1000) / 10,
  };
}
