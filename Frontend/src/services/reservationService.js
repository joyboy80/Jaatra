import { apiRequest } from "./api.js";

export async function getReservations(userId) {
  void userId;
  return (await apiRequest("/transport/reservations")).reservations;
}

export async function getAllReservations() {
  return (await apiRequest("/admin/transport/reservations")).reservations;
}

export async function getReservedSeats(tripId, date) {
  return (await apiRequest(`/transport/reservations/seats?tripId=${encodeURIComponent(tripId)}&date=${encodeURIComponent(date)}`)).seats;
}

export async function createReservation({ tripId, date, seatNumber }) {
  return apiRequest("/transport/reservations", { method: "POST", body: { tripId, date, seatNumber } });
}

export async function cancelReservation(bookingId, userId) {
  void userId;
  return (await apiRequest(`/transport/reservations/${encodeURIComponent(bookingId)}`, { method: "DELETE" })).reservation;
}
