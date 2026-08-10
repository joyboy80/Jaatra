const TICKET_KEY = "jaatra.tickets";

function readTickets() {
  if (typeof localStorage === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(TICKET_KEY)) || [];
  } catch (_error) {
    return [];
  }
}

export async function getTickets(userId) {
  if (backendEnabled) return (await apiRequest("/transport/tickets")).tickets;
  return readTickets().filter((ticket) => ticket.userId === userId);
}

export async function getTicketById(userId, ticketId) {
  if (backendEnabled) return (await apiRequest(`/transport/tickets/${encodeURIComponent(ticketId)}`)).ticket;
  return readTickets().find((ticket) => ticket.userId === userId && ticket.ticketId === ticketId);
}
import { apiRequest, backendEnabled } from "./api.js";
