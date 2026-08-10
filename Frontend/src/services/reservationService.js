import { trips } from "../data/trips.js";
import { createNotification } from "./notificationService.js";

const STORAGE_KEY = "jaatra.reservations";
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
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function seededReservedSeats(tripId, date) {
  const seed = `${tripId}-${date}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const reserved = new Set();

  for (let index = 0; index < 6; index += 1) {
    const row = ((seed + index * 7) % 9) + 1;
    const column = ["A", "B", "C", "D"][(seed + index) % 4];
    reserved.add(`${row}${column}`);
  }

  return [...reserved];
}

export async function getReservations(userId) {
  const reservations = readJson(STORAGE_KEY, []);
  return reservations.filter((reservation) => reservation.userId === userId);
}

export async function getAllReservations() {
  return readJson(STORAGE_KEY, []);
}

export async function getReservedSeats(tripId, date) {
  const reservations = readJson(STORAGE_KEY, []);
  const bookedSeats = reservations
    .filter((reservation) => reservation.tripId === tripId && reservation.date === date && reservation.status !== "Cancelled")
    .map((reservation) => reservation.seatNumber);

  return [...new Set([...seededReservedSeats(tripId, date), ...bookedSeats])];
}

export async function createReservation({ user, role, tripId, date, seatNumber }) {
  const trip = trips.find((item) => item.id === tripId);

  if (!trip) {
    throw new Error("Trip not found.");
  }

  const reservedSeats = await getReservedSeats(tripId, date);

  if (reservedSeats.includes(seatNumber)) {
    throw new Error("That seat has already been reserved. Please select another seat.");
  }

  const bookingId = makeId("BKG");
  const ticketId = makeId("TKT");
  const reservation = {
    id: bookingId,
    bookingId,
    ticketId,
    userId: user.id,
    passengerName: user.name || "Jaatra Passenger",
    email: user.email,
    role,
    roleLabel: user.roleLabel,
    tripId,
    busId: trip.busId,
    busName: trip.busName,
    busNumber: trip.busNumber,
    busCategory: trip.busCategory,
    route: trip.route,
    date,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    seatNumber,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
    universityId: user.universityId || user.id,
  };

  const ticket = {
    ...reservation,
    id: ticketId,
    status: "Confirmed",
    qrPayload: ticketId,
  };

  writeJson(STORAGE_KEY, [...readJson(STORAGE_KEY, []), reservation]);
  writeJson(TICKET_KEY, [...readJson(TICKET_KEY, []), ticket]);
  createNotification(user.id, role, {
    type: "reservation",
    title: "Reservation confirmed",
    message: `Your seat on ${trip.busName} has been confirmed.`,
    tone: "success",
  });

  return { reservation, ticket };
}

export async function cancelReservation(bookingId, userId) {
  const reservations = readJson(STORAGE_KEY, []);
  const tickets = readJson(TICKET_KEY, []);
  let updatedReservation = null;

  const nextReservations = reservations.map((reservation) => {
    if (reservation.bookingId === bookingId && reservation.userId === userId && reservation.status === "Confirmed") {
      updatedReservation = { ...reservation, status: "Cancelled", cancelledAt: new Date().toISOString() };
      return updatedReservation;
    }

    return reservation;
  });

  const nextTickets = tickets.map((ticket) =>
    ticket.bookingId === bookingId && ticket.userId === userId
      ? { ...ticket, status: "Cancelled", cancelledAt: new Date().toISOString() }
      : ticket
  );

  writeJson(STORAGE_KEY, nextReservations);
  writeJson(TICKET_KEY, nextTickets);

  if (updatedReservation) {
    createNotification(updatedReservation.userId, updatedReservation.role, {
      type: "cancellation",
      title: "Reservation cancelled",
      message: `Your scheduled trip on ${updatedReservation.busName} has been cancelled.`,
      tone: "danger",
    });
  }

  return updatedReservation;
}
