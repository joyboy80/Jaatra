import { apiRequest } from "./api.js";

export async function getLiveLocations() {
  return (await apiRequest("/transport/tracking")).buses;
}

export async function getLiveBus(busId) {
  return (await apiRequest(`/transport/tracking/${encodeURIComponent(busId)}`)).bus;
}

export function subscribeToTracking(listener, onError) {
  let active = true;
  const poll = async () => {
    try {
      const buses = await getLiveLocations();
      if (active) listener(buses);
    } catch (error) {
      if (active) onError?.(error);
    }
  };
  poll();
  const timer = typeof window !== "undefined" ? window.setInterval(poll, 5000) : null;
  return () => {
    active = false;
    if (timer) window.clearInterval(timer);
  };
}

export async function publishDriverLocation(location) {
  return (await apiRequest("/driver/transport/location", { method: "PUT", body: location })).location;
}
