import { apiRequest } from "./api.js";

export async function getTickets(userId) {
  void userId;
  return (await apiRequest("/transport/tickets")).tickets;
}

export async function getTicketById(userId, ticketId) {
  void userId;
  return (await apiRequest(`/transport/tickets/${encodeURIComponent(ticketId)}`)).ticket;
}

export async function downloadTicket(ticketId) {
  const response = await fetch(`/api/transport/tickets/${encodeURIComponent(ticketId)}/download`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("safar_access")}` } // fallback if needed, but cookies are used
  });
  if (!response.ok) throw new Error("Failed to download ticket.");
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `safar-ticket-${ticketId}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadInvoice(ticketId, invoiceNumber) {
  const response = await fetch(`/api/transport/tickets/${encodeURIComponent(ticketId)}/invoice`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("safar_access")}` }
  });
  if (!response.ok) throw new Error("Failed to download invoice.");
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${invoiceNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function shareTicket(ticketId) {
  return (await apiRequest(`/transport/tickets/${encodeURIComponent(ticketId)}/share`, { method: "POST" })).link;
}
