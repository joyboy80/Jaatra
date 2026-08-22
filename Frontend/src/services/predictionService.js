import { apiRequest } from "./api.js";

export async function getOccupancyPredictions() {
  return (await apiRequest("/admin/transport/predictions/occupancy")).predictions;
}

export async function getSmartTransportationInsights() {
  return (await apiRequest("/admin/transport/predictions/insights")).insights;
}

export async function predictBusOccupancy() {
  // Not explicitly used in the UI, but we can map it to occupancy
  return getOccupancyPredictions();
}
