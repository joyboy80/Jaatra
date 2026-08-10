import { buses } from "../data/buses.js";
import { getBusForRole, getBusesForRole } from "../utils/busAccess.js";

export async function getBuses() {
  return buses;
}

export async function getBusById(id) {
  return buses.find((bus) => bus.id === id);
}

export async function getBusesByRole(role) {
  return getBusesForRole(role);
}

export async function getBusByRole(role, id) {
  return getBusForRole(role, id);
}
