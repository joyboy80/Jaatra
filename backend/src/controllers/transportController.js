import {
  adminAnalytics,
  adminBuses,
  adminDrivers,
  adminOverview,
  adminSchedules,
  adminUsers,
  cancelReservation,
  clearNotifications,
  createDriverReport,
  deleteAdminBus,
  deleteAdminRoute,
  deleteAdminSchedule,
  driverTrips,
  getTicket,
  listBuses,
  listNotifications,
  listReservations,
  listRoutes,
  listTickets,
  listTracking,
  listTrips,
  maintenanceRecords,
  markNotification,
  operationalAlerts,
  passengerManifest,
  reserveSeat,
  reservedSeats,
  saveAdminBus,
  saveAdminRoute,
  saveAdminSchedule,
  tripSummary,
  updateAdminDriver,
  updateAdminUser,
  updateDriverLocation,
  updateDriverTrip,
  updateMaintenance,
  verifyDriverTicket,
} from "../services/transportService.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

function text(value, label, { optional = false } = {}) {
  const result = typeof value === "string" ? value.trim() : "";
  if (!result && !optional) throw new AppError(400, `${label} is required.`, "VALIDATION_ERROR");
  return result;
}

function reservationInput(body = {}) {
  const tripId = text(body.tripId, "Trip");
  const date = text(body.date, "Travel date");
  const seatNumber = text(body.seatNumber, "Seat").toUpperCase();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError(400, "Travel date is invalid.", "INVALID_TRAVEL_DATE");
  if (!/^[1-9][0-9]?[A-D]$/.test(seatNumber)) throw new AppError(400, "Seat number is invalid.", "INVALID_SEAT");
  return { tripId, date, seatNumber };
}

export const buses = asyncHandler(async (req, res) => sendSuccess(res, { data: { buses: await listBuses(req.user.userType) } }));
export const bus = asyncHandler(async (req, res) => {
  const result = await listBuses(req.user.userType, req.params.id);
  if (!result) throw new AppError(404, "Bus not found or unavailable for this role.", "BUS_NOT_FOUND");
  return sendSuccess(res, { data: { bus: result } });
});
export const routes = asyncHandler(async (_req, res) => sendSuccess(res, { data: { routes: await listRoutes() } }));
export const trips = asyncHandler(async (req, res) => sendSuccess(res, { data: { trips: await listTrips(req.user.userType) } }));
export const reservations = asyncHandler(async (req, res) => sendSuccess(res, { data: { reservations: await listReservations(req.user.profileId) } }));
export const seats = asyncHandler(async (req, res) => sendSuccess(res, { data: { seats: await reservedSeats(text(req.query.tripId, "Trip"), text(req.query.date, "Travel date")) } }));
export const createReservation = asyncHandler(async (req, res) => sendSuccess(res, { status: 201, data: await reserveSeat(req.user.profileId, reservationInput(req.body)), message: "Reservation confirmed." }));
export const removeReservation = asyncHandler(async (req, res) => sendSuccess(res, { data: { reservation: await cancelReservation(req.user.profileId, req.params.id) }, message: "Reservation cancelled." }));
export const tickets = asyncHandler(async (req, res) => sendSuccess(res, { data: { tickets: await listTickets(req.user.profileId) } }));
export const ticket = asyncHandler(async (req, res) => {
  const result = await getTicket(req.user.profileId, req.params.id);
  if (!result) throw new AppError(404, "Ticket not found.", "TICKET_NOT_FOUND");
  return sendSuccess(res, { data: { ticket: result } });
});
export const tracking = asyncHandler(async (req, res) => sendSuccess(res, { data: { buses: await listTracking(req.user.userType) } }));
export const trackingBus = asyncHandler(async (req, res) => sendSuccess(res, { data: { bus: (await listTracking(req.user.userType, req.params.id))[0] || null } }));
export const serviceStatus = asyncHandler(async (_req, res) => {
  const [maintenance, alerts] = await Promise.all([maintenanceRecords(), operationalAlerts()]);
  return sendSuccess(res, { data: { maintenance, alerts: { conditions: alerts.conditions, delays: alerts.delays, emergencies: [] } } });
});
export const notifications = asyncHandler(async (req, res) => sendSuccess(res, { data: { notifications: await listNotifications(req.user) } }));
export const readNotification = asyncHandler(async (req, res) => sendSuccess(res, { data: { notifications: await markNotification(req.user, req.params.id) } }));
export const readAllNotifications = asyncHandler(async (req, res) => sendSuccess(res, { data: { notifications: await markNotification(req.user) } }));
export const removeNotifications = asyncHandler(async (req, res) => sendSuccess(res, { data: { notifications: await clearNotifications(req.user) } }));

export const assignedTrips = asyncHandler(async (req, res) => sendSuccess(res, { data: { trips: await driverTrips(req.user) } }));
export const manifest = asyncHandler(async (req, res) => sendSuccess(res, { data: { passengers: await passengerManifest(req.user, req.params.id) } }));
export const summary = asyncHandler(async (req, res) => sendSuccess(res, { data: { summary: await tripSummary(req.user, req.params.id) } }));
export const changeTripStatus = asyncHandler(async (req, res) => {
  const status = text(req.body.status, "Trip status");
  if (!["Upcoming", "Boarding", "In Progress", "Completed", "Cancelled"].includes(status)) throw new AppError(400, "Unsupported trip status.", "INVALID_TRIP_STATUS");
  return sendSuccess(res, { data: { trip: await updateDriverTrip(req.user, req.params.id, status) } });
});
export const publishLocation = asyncHandler(async (req, res) => {
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new AppError(400, "A valid GPS coordinate is required.", "INVALID_LOCATION");
  }
  const location = await updateDriverLocation(req.user, { ...req.body, tripId: text(req.body.tripId, "Trip"), latitude, longitude });
  return sendSuccess(res, { data: { location } });
});
export const scanTicket = asyncHandler(async (req, res) => sendSuccess(res, { data: { ticket: await verifyDriverTicket(req.user, text(req.body.ticketId, "Ticket"), text(req.body.tripId, "Trip")) } }));
export const conditionReport = asyncHandler(async (req, res) => sendSuccess(res, { status: 201, data: { report: await createDriverReport(req.user, "CONDITION", req.body) } }));
export const delayReport = asyncHandler(async (req, res) => sendSuccess(res, { status: 201, data: { report: await createDriverReport(req.user, "DELAY", req.body) } }));
export const emergencyReport = asyncHandler(async (req, res) => sendSuccess(res, { status: 201, data: { report: await createDriverReport(req.user, "EMERGENCY", req.body) } }));

export const getAdminBuses = asyncHandler(async (_req, res) => sendSuccess(res, { data: { buses: await adminBuses() } }));
export const putAdminBus = asyncHandler(async (req, res) => sendSuccess(res, { data: { bus: await saveAdminBus(req.body) } }));
export const removeAdminBus = asyncHandler(async (req, res) => { await deleteAdminBus(req.params.id); return sendSuccess(res, { message: "Bus deleted." }); });
export const getAdminRoutes = asyncHandler(async (_req, res) => sendSuccess(res, { data: { routes: await listRoutes() } }));
export const putAdminRoute = asyncHandler(async (req, res) => sendSuccess(res, { data: { route: await saveAdminRoute(req.body) } }));
export const removeAdminRoute = asyncHandler(async (req, res) => { await deleteAdminRoute(req.params.id); return sendSuccess(res, { message: "Route deleted." }); });
export const getAdminSchedules = asyncHandler(async (_req, res) => sendSuccess(res, { data: { schedules: await adminSchedules() } }));
export const putAdminSchedule = asyncHandler(async (req, res) => sendSuccess(res, { data: { schedule: await saveAdminSchedule(req.body) } }));
export const removeAdminSchedule = asyncHandler(async (req, res) => { await deleteAdminSchedule(req.params.id); return sendSuccess(res, { message: "Schedule deleted." }); });
export const getAdminReservations = asyncHandler(async (_req, res) => sendSuccess(res, { data: { reservations: await listReservations(null, { all: true }) } }));
export const getAdminUsers = asyncHandler(async (_req, res) => sendSuccess(res, { data: { users: await adminUsers() } }));
export const putAdminUser = asyncHandler(async (req, res) => sendSuccess(res, { data: { user: await updateAdminUser(req.params.id, req.body) } }));
export const getAdminDrivers = asyncHandler(async (_req, res) => sendSuccess(res, { data: { drivers: await adminDrivers() } }));
export const putAdminDriver = asyncHandler(async (req, res) => sendSuccess(res, { data: { driver: await updateAdminDriver(req.params.id, req.body) } }));
export const getMaintenance = asyncHandler(async (_req, res) => sendSuccess(res, { data: { maintenance: await maintenanceRecords() } }));
export const putMaintenance = asyncHandler(async (req, res) => sendSuccess(res, { data: { maintenance: await updateMaintenance(req.params.id, req.body) } }));
export const getAlerts = asyncHandler(async (_req, res) => sendSuccess(res, { data: { alerts: await operationalAlerts() } }));
export const getOverview = asyncHandler(async (_req, res) => sendSuccess(res, { data: { overview: await adminOverview() } }));
export const getAnalytics = asyncHandler(async (_req, res) => sendSuccess(res, { data: { analytics: await adminAnalytics() } }));
