import { apiRequest } from "./api.js";

function queryForDate(date) { return date ? `?date=${encodeURIComponent(date)}` : ""; }

export async function getBuses(date) {
  return (await apiRequest(`/transport/buses${queryForDate(date)}`)).buses;
}

export async function getBusById(id, date) {
  return (await apiRequest(`/transport/buses/${encodeURIComponent(id)}${queryForDate(date)}`)).bus;
}

export async function getBusesByRole(role, date) {
  void role;
  return getBuses(date);
}

export async function getBusByRole(role, id, date) {
  void role;
  return getBusById(id, date);
}
