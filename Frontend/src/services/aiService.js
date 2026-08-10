import { buses as busData } from "../data/buses.js";
import { trips } from "../data/trips.js";
import { getMaintenanceRecords, getOperationalAlerts } from "./adminService.js";
import { getReservations } from "./reservationService.js";
import { getLiveLocations, getTrackingSnapshot } from "./trackingService.js";
import { getRouteRecommendation } from "./recommendationService.js";
import { getBusesForRole, parseDepartureMinutes } from "../utils/busAccess.js";
import { toDateInputValue } from "../utils/date.js";
import { apiRequest, backendEnabled } from "./api.js";
import { getBusesByRole } from "./busService.js";
import { getSchedules } from "./scheduleService.js";

const CHAT_PREFIX = "jaatra.ai.conversation";

export const suggestedQuestions = [
  "Where is my bus?",
  "What buses are available today?",
  "Is Padma running today?",
  "Why is my bus delayed?",
  "Is Surma okay today?",
  "Which bus should I take to arrive before 9 AM?",
];

function timestamp() {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());
}

function conversationKey(userId) {
  return `${CHAT_PREFIX}.${userId}`;
}

export function getConversation(userId) {
  if (typeof localStorage !== "undefined") {
    try {
      const saved = JSON.parse(localStorage.getItem(conversationKey(userId)));
      if (saved?.length) return saved;
    } catch (_error) {
      // Start a new conversation when stored mock data is invalid.
    }
  }
  return [{ id: "welcome", role: "assistant", content: "Hi, I am Jaatra AI. Ask me about your bus, routes, seats, delays, or the best trip to take.", timestamp: timestamp() }];
}

export function saveConversation(userId, messages) {
  if (typeof localStorage !== "undefined") localStorage.setItem(conversationKey(userId), JSON.stringify(messages));
  return messages;
}

export function clearConversation(userId) {
  if (typeof localStorage !== "undefined") localStorage.removeItem(conversationKey(userId));
  return getConversation(userId);
}

export async function getAIContext({ user, role }) {
  const statusPromise = backendEnabled
    ? apiRequest("/transport/status")
    : Promise.all([getMaintenanceRecords(), getOperationalAlerts()]).then(([maintenance, alerts]) => ({ maintenance, alerts }));
  const [reservations, status, availableBuses, tracking, schedules] = await Promise.all([
    getReservations(user.id),
    statusPromise,
    backendEnabled ? getBusesByRole(role) : Promise.resolve(getBusesForRole(role)),
    backendEnabled ? getLiveLocations() : Promise.resolve(getTrackingSnapshot()),
    backendEnabled ? getSchedules() : Promise.resolve(trips),
  ]);
  const activeReservation = reservations.find((reservation) => reservation.status === "Confirmed" && reservation.date >= toDateInputValue()) || null;
  const reservedBus = activeReservation ? tracking.find((bus) => bus.id === activeReservation.busId) || null : null;
  return {
    user,
    role,
    reservations,
    activeReservation,
    reservedBus,
    availableBuses,
    tracking,
    maintenance: status.maintenance,
    delayReports: status.alerts.delays,
    schedules,
  };
}

function busFromPrompt(prompt, context) {
  const lower = prompt.toLowerCase();
  return context.tracking.find((bus) => lower.includes(bus.name.toLowerCase())) || context.reservedBus;
}

function conditionForBus(bus, context) {
  return context.maintenance.find((record) => record.busId === bus?.id);
}

function answer(content, extra = {}) {
  return { id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, role: "assistant", content, timestamp: timestamp(), ...extra };
}

export async function askJaatraAI({ prompt, user, role }) {
  await new Promise((resolve) => setTimeout(resolve, 650));
  const context = await getAIContext({ user, role });
  const lower = prompt.trim().toLowerCase();
  const bus = busFromPrompt(prompt, context);

  if ((lower.includes("where") || lower.includes("location")) && lower.includes("my bus")) {
    if (!context.reservedBus) return answer("You do not have a confirmed reservation for today or a future trip. I can still help you choose an available bus.");
    return answer(`Your reserved bus is ${context.reservedBus.name}. It is currently near ${context.reservedBus.currentLocation.label}. Estimated arrival at the next stop is ${context.reservedBus.etaMinutes} minutes.`);
  }

  if ((lower.includes("available today") || lower.includes("buses are available")) && !lower.includes("after 5")) {
    const names = context.availableBuses.map((item) => `${item.name} (${item.availableSeats} seats)`).join(", ");
    return answer(`Buses available for ${user.roleLabel.toLowerCase()} travel today are ${names}.`);
  }

  if (lower.includes("after 5")) {
    const allowedIds = new Set(context.availableBuses.map((item) => item.id));
    const lateTrips = context.schedules.filter((trip) => allowedIds.has(trip.busId) && parseDepartureMinutes(trip.departureTime) >= 17 * 60);
    return answer(lateTrips.length ? `Available after 5 PM: ${lateTrips.map((trip) => `${trip.busName} at ${trip.departureTime}`).join(", ")}.` : "There are no scheduled departures after 5 PM in the current timetable. The latest service leaves at 4:30 PM.");
  }

  if (lower.includes("which bus") || lower.includes("should i take") || lower.includes("reach") || lower.includes("before 9")) {
    const recommendation = await getRouteRecommendation({ role, prompt });
    if (!recommendation) return answer("I could not find a suitable trip for that request. Try including your destination and arrival time.");
    return answer(`I recommend ${recommendation.busName}. It arrives at ${recommendation.arrivalTime} with ${recommendation.availableSeats} seats currently available.`, { recommendation });
  }

  if ((lower.includes("condition") || lower.includes("okay") || lower.includes("problem")) && bus) {
    const condition = conditionForBus(bus, context);
    if (!condition) return answer(`${bus.name} has no open maintenance report and is currently marked ${bus.status}.`);
    return answer(`${bus.name} is marked ${condition.condition}. Latest report: ${condition.reportedIssue}. Live service status is ${bus.status}.`);
  }

  if ((lower.includes("why") && lower.includes("delay")) || lower.includes("my bus delayed")) {
    if (!bus) return answer("Tell me the bus name and I will check its live delay and driver reports.");
    if (bus.status !== "Delayed") return answer(`${bus.name} is currently ${bus.status.toLowerCase()} with no active delay. ETA is ${bus.etaMinutes} minutes.`);
    const report = context.delayReports.find((item) => item.busId === bus.id);
    return answer(`${bus.name} is delayed by ${bus.delayMinutes || report?.estimatedDelay || 10} minutes${report?.reason ? ` due to ${report.reason.toLowerCase()}` : ""}. It is currently near ${bus.currentLocation.label}.`);
  }

  if ((lower.includes("seat") || lower.includes("how many")) && bus) {
    const record = backendEnabled ? bus : busData.find((item) => item.id === bus.id);
    return answer(`${bus.name} currently has ${record?.availableSeats ?? bus.availableSeats} seats available out of ${record?.capacity ?? bus.capacity}.`);
  }

  if (lower.includes("arrived") && bus) {
    return answer(bus.status === "Completed" ? `${bus.name} has completed its current trip.` : `${bus.name} has not arrived yet. It is ${bus.status.toLowerCase()} near ${bus.currentLocation.label}, with an ETA of ${bus.etaMinutes} minutes.`);
  }

  if (bus && (lower.includes("where") || lower.includes("running") || lower.includes("status"))) {
    return answer(`${bus.name} is currently ${bus.status.toLowerCase()} near ${bus.currentLocation.label}. Its next stop is ${bus.nextStop}, speed is ${bus.speed} km/h, and ETA is ${bus.etaMinutes} minutes.`);
  }

  return answer("I can help with live bus locations, seat availability, delays, bus condition, schedules, and route recommendations. Try asking, 'Where is my bus?' or 'Which bus should I take before 9 AM?'");
}
