import { allocationRecommendations } from "../data/aiInsights.js";
import { trips } from "../data/trips.js";
import { getBusesForRole, parseDepartureMinutes } from "../utils/busAccess.js";
import { backendEnabled } from "./api.js";
import { getBusesByRole } from "./busService.js";
import { getSchedules } from "./scheduleService.js";

function targetMinutesFromPrompt(prompt) {
  const match = prompt.match(/before\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return 9 * 60;
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return hour * 60 + minute;
}

export async function getRouteRecommendation({ role, prompt = "" }) {
  const allowedBuses = backendEnabled ? await getBusesByRole(role) : getBusesForRole(role);
  const availableTrips = backendEnabled ? await getSchedules() : trips;
  const allowedIds = new Set(allowedBuses.map((bus) => bus.id));
  const targetMinutes = targetMinutesFromPrompt(prompt);
  const candidates = availableTrips
    .filter((trip) => allowedIds.has(trip.busId) && parseDepartureMinutes(trip.arrivalTime) <= targetMinutes)
    .map((trip) => ({ ...trip, bus: allowedBuses.find((bus) => bus.id === trip.busId) }))
    .sort((a, b) => parseDepartureMinutes(b.arrivalTime) - parseDepartureMinutes(a.arrivalTime) || b.bus.availableSeats - a.bus.availableSeats);

  const selected = candidates[0] || availableTrips.map((trip) => ({ ...trip, bus: allowedBuses.find((bus) => bus.id === trip.busId) })).find((trip) => trip.bus);
  if (!selected) return null;

  return {
    busId: selected.busId,
    busName: selected.busName,
    route: selected.route,
    departureTime: selected.departureTime,
    arrivalTime: selected.arrivalTime,
    availableSeats: selected.bus.availableSeats,
    reasons: ["Suitable arrival time", "Short travel time", "Seats available"],
  };
}

export async function getBusAllocationRecommendations() {
  return allocationRecommendations.map((recommendation) => ({ ...recommendation }));
}
