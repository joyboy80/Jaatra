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

function transportError(error, operation, code = "TRANSPORT_ERROR") {
  if (error?.code === "23505") return new AppError(409, "That seat or unique transport value is already in use.", "TRANSPORT_CONFLICT");
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
  return {
    ...serializeReservation(reservation),
    id: row.id,
    ticketId: row.id,
    status: row.status,
    qrPayload: row.qr_payload,
    usedAt: row.used_at,
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

async function reservationCounts() {
  const { data, error } = await getSupabaseAdmin().from("reservations").select("bus_id")
    .eq("travel_date", serviceDate()).neq("status", "Cancelled");
  if (error) throw transportError(error, "count active reservations");
  return (data || []).reduce((counts, item) => counts.set(item.bus_id, (counts.get(item.bus_id) || 0) + 1), new Map());
}

export async function listBuses(userType, busId) {
  let query = getSupabaseAdmin().from("buses").select("*").order("id");
  const categories = CATEGORY_BY_ROLE[userType];
  if (categories) query = query.in("category", categories);
  if (busId) query = query.eq("id", busId);
  const [{ data, error }, counts] = await Promise.all([query, reservationCounts()]);
  if (error) throw transportError(error, "read buses");
  const buses = (data || []).map((bus) => serializeBus(bus, counts.get(bus.id) || 0));
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

export async function listTrips(userType) {
  const { data, error } = await getSupabaseAdmin().from("transport_trips").select("*, buses(*)").order("id");
  if (error) throw transportError(error, "read trips");
  const categories = CATEGORY_BY_ROLE[userType];
  return (data || []).filter((row) => !categories || categories.includes(row.buses?.category)).map(serializeTrip);
}

export async function listReservations(profileId, { all = false } = {}) {
  let query = getSupabaseAdmin().from("reservations").select("*").order("created_at", { ascending: false });
  if (!all) query = query.eq("profile_id", profileId);
  const { data, error } = await query;
  if (error) throw transportError(error, "read reservations");
  return (data || []).map(serializeReservation);
}

export async function reservedSeats(tripId, travelDate) {
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

export async function listTickets(profileId) {
  const { data, error } = await getSupabaseAdmin().from("tickets").select("*, reservations(*)")
    .eq("profile_id", profileId).order("created_at", { ascending: false });
  if (error) throw transportError(error, "read tickets");
  return (data || []).map(serializeTicket);
}

export async function getTicket(profileId, ticketId) {
  const { data, error } = await getSupabaseAdmin().from("tickets").select("*, reservations(*)")
    .eq("profile_id", profileId).eq("id", ticketId).maybeSingle();
  if (error) throw transportError(error, "read ticket");
  return data ? serializeTicket(data) : null;
}

export async function listTracking(userType, busId) {
  const [{ data, error }, counts] = await Promise.all([
    getSupabaseAdmin().from("tracking_positions").select("*, buses(*)").order("bus_id"),
    reservationCounts(),
  ]);
  if (error) throw transportError(error, "read live tracking");
  const categories = CATEGORY_BY_ROLE[userType];
  const rows = (data || []).filter((row) => (!busId || row.bus_id === busId) && (!categories || categories.includes(row.buses?.category)));
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
  const bus = await assignedBusForDriver(user);
  if (!bus) return [];
  const { data, error } = await getSupabaseAdmin().from("transport_trips").select("*, buses(*)").eq("bus_id", bus.id).order("departure_time");
  if (error) throw transportError(error, "read assigned trips");
  return (data || []).map((row, index) => ({
    ...serializeTrip(row),
    date: serviceDate(),
    status: ["Boarding", "In Progress", "Completed", "Cancelled"].includes(row.status) ? row.status : index === 0 ? "Boarding" : "Upcoming",
    currentLocation: bus.location_label,
    nextStop: bus.next_stop,
    eta: `${bus.eta_minutes || 0} min`,
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
  const { data, error } = await getSupabaseAdmin().from("transport_trips").update({ status }).eq("id", tripId).select("*, buses(*)").single();
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
  const { data, error } = await getSupabaseAdmin().rpc("verify_transport_ticket", {
    p_driver_profile_id: user.profileId,
    p_ticket_id: ticketId.trim().toUpperCase(),
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

export async function adminBuses() { return listBuses("TRANSPORT_ADMIN"); }

function busInput(input, existing = {}) {
  const routeParts = String(input.route || existing.route || "Campus - Destination").split(" - ");
  return {
    id: input.id || existing.id || id("BUS"),
    name: input.name,
    number: input.number,
    category: input.type,
    capacity: Number(input.capacity),
    route: input.route,
    stops: input.stops?.length ? input.stops : existing.stops || routeParts,
    departure_time: input.departureTime || existing.departure_time || "07:30 AM",
    arrival_time: input.arrivalTime || existing.arrival_time || "08:20 AM",
    status: input.status || existing.status || "On Time",
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
  const existing = input.id ? (await admin.from("buses").select("*").eq("id", input.id).maybeSingle()).data : null;
  const row = busInput(input, existing || {});
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
