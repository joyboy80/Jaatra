import { trips } from "../data/trips.js";
import { apiRequest, backendEnabled } from "./api.js";

export async function getSchedules() {
  if (backendEnabled) return (await apiRequest("/transport/trips")).trips;
  return trips;
}
