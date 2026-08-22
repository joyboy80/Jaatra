import { listRoutes } from "./transportService.js";

export async function getBusAllocationRecommendations() {
  const routes = await listRoutes();
  if (!routes || routes.length < 2) return [];

  // Generate 2 dummy recommendations for UI
  return [
    {
      id: "rec-1",
      confidence: Math.floor(Math.random() * 15) + 80, // 80-95%
      sourceRoute: routes[0]?.name || "Route A",
      sourceDemand: Math.floor(Math.random() * 20) + 30, // 30-50%
      targetRoute: routes[1]?.name || "Route B",
      targetDemand: Math.floor(Math.random() * 15) + 85, // 85-100%
      period: "Next Departure Window",
      recommendation: `Consider reallocating one bus from ${routes[0]?.name || "Route A"} to ${routes[1]?.name || "Route B"} to handle anticipated passenger surge.`
    },
    {
      id: "rec-2",
      confidence: Math.floor(Math.random() * 10) + 75,
      sourceRoute: routes[routes.length - 1]?.name || "Route C",
      sourceDemand: Math.floor(Math.random() * 15) + 20,
      targetRoute: routes[0]?.name || "Route A",
      targetDemand: Math.floor(Math.random() * 20) + 75,
      period: "Evening Shift",
      recommendation: "Low historical demand detected on source route. Reallocation can optimize fuel and driver hours."
    }
  ];
}
