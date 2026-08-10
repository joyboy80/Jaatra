import { apiRequest, backendEnabled } from "./api.js";

export async function getRoutes() {
  if (backendEnabled) return (await apiRequest("/transport/routes")).routes;
  return [];
}
