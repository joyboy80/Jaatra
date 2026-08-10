import { parseDepartureMinutes } from "./busAccess.js";
import { toDateInputValue } from "./date.js";

export function getReservationState(reservation) {
  if (reservation.status === "Cancelled") return "Cancelled";
  if (reservation.status === "Used" || reservation.status === "Expired") return "Completed";

  const todayValue = toDateInputValue();

  if (reservation.date < todayValue) return "Completed";
  if (reservation.date > todayValue) return "Upcoming";

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const departureMinutes = parseDepartureMinutes(reservation.departureTime);
  const arrivalMinutes = parseDepartureMinutes(reservation.arrivalTime);

  if (nowMinutes < departureMinutes) return "Upcoming";
  if (nowMinutes >= departureMinutes && nowMinutes <= arrivalMinutes) return "Active";
  return "Completed";
}

export function canCancelReservation(reservation) {
  const state = getReservationState(reservation);
  return state === "Upcoming";
}
