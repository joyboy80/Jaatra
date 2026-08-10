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
  return readTickets().filter((ticket) => ticket.userId === userId);
}

export async function getTicketById(userId, ticketId) {
  return readTickets().find((ticket) => ticket.userId === userId && ticket.ticketId === ticketId);
}
