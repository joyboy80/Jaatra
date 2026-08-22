import { apiRequest } from "./api.js";

export async function getRouteRecommendation() {
  return [];
}

export async function getBusAllocationRecommendations() {
  return (await apiRequest("/admin/transport/recommendations/allocations")).allocations;
}
