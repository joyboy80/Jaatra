import { apiRequest } from "./api.js";

export async function getSchedules(date) {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return (await apiRequest(`/transport/trips${query}`)).trips;
}
