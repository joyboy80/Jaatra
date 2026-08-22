import { apiRequest } from "./api.js";

export async function getRoutes() {
  return (await apiRequest("/transport/routes")).routes;
}
