import { buses } from "../data/buses.js";
import { getBusForRole, getBusesForRole } from "../utils/busAccess.js";
import { apiRequest, backendEnabled } from "./api.js";

export async function getBuses() {
  if (backendEnabled) return (await apiRequest("/transport/buses")).buses;
  return buses;
}

export async function getBusById(id) {
  if (backendEnabled) return (await apiRequest(`/transport/buses/${encodeURIComponent(id)}`)).bus;
  return buses.find((bus) => bus.id === id);
}

export async function getBusesByRole(role) {
  if (backendEnabled) return (await apiRequest("/transport/buses")).buses;
  return getBusesForRole(role);
}

export async function getBusByRole(role, id) {
  if (backendEnabled) return (await apiRequest(`/transport/buses/${encodeURIComponent(id)}`)).bus;
  return getBusForRole(role, id);
}
