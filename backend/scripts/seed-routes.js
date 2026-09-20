import "dotenv/config";
import { getSupabaseAdmin, verifySupabaseConnection } from "../src/config/supabase.js";

export const PREDEFINED_ROUTES = [
  {
    id: "CUET_STATION_DIRECT",
    name: "Route 1 — Direct via Flyover",
    direction: "CUET → Station",
    start_point: "CUET Campus",
    destination: "Station",
    stops: [
      "CUET Campus",
      "Noapara",
      "Rastar Matha",
      "Bahaddarhat",
      "Muradpur Flyover",
      "Lalkhan Bazar",
      "Station",
    ],
    estimated_minutes: 75,
  },
  {
    id: "CUET_STATION_GEC",
    name: "Route 2 — via GEC",
    direction: "CUET → Station",
    start_point: "CUET Campus",
    destination: "Station",
    stops: [
      "CUET Campus",
      "Noapara",
      "Rastar Matha",
      "Bahaddarhat",
      "Muradpur",
      "2 No. Gate",
      "GEC",
      "Wasa",
      "Lalkhan Bazar",
      "Station",
    ],
    estimated_minutes: 75,
  },
  {
    id: "CUET_STATION_FLYOVER_GEC",
    name: "Route 3 — via Flyover & GEC",
    direction: "CUET → Station",
    start_point: "CUET Campus",
    destination: "Station",
    stops: [
      "CUET Campus",
      "Noapara",
      "Rastar Matha",
      "Bahaddarhat",
      "Muradpur Flyover",
      "GEC",
      "Wasa",
      "Lalkhan Bazar",
      "Station",
    ],
    estimated_minutes: 75,
  },
  {
    id: "STATION_CUET_BAHADDARHAT",
    name: "Route 4 — Return via Bahaddarhat",
    direction: "Station → CUET",
    start_point: "Station",
    destination: "CUET",
    stops: [
      "Station",
      "Lalkhan Bazar",
      "Flyover",
      "Bahaddarhat",
      "Rastar Matha",
      "Noapara",
      "CUET",
    ],
    estimated_minutes: 80,
  },
  {
    id: "STATION_CUET_GEC",
    name: "Route 5 — Return via GEC",
    direction: "Station → CUET",
    start_point: "Station",
    destination: "CUET Campus",
    stops: [
      "Station",
      "Lalkhan Bazar",
      "Wasa",
      "GEC",
      "2 No. Gate",
      "Muradpur",
      "Bahaddarhat",
      "Rastar Matha",
      "Noapara",
      "CUET Campus",
    ],
    estimated_minutes: 80,
  },
];

export async function seedPredefinedRoutes() {
  await verifySupabaseConnection();
  const admin = getSupabaseAdmin();

  console.log("Seeding 4 predefined routes into transport_routes...");

  for (const route of PREDEFINED_ROUTES) {
    // Try upserting with direction
    let upsertError = null;
    const { error } = await admin.from("transport_routes").upsert(
      {
        id: route.id,
        name: route.name,
        direction: route.direction,
        start_point: route.start_point,
        destination: route.destination,
        stops: route.stops,
        estimated_minutes: route.estimated_minutes,
      },
      { onConflict: "id" }
    );

    if (error) {
      upsertError = error;
      // If error is due to missing direction column (schema cache), fallback without direction
      if (error.code === "PGRST204" || error.message?.includes("direction")) {
        const { error: fallbackError } = await admin.from("transport_routes").upsert(
          {
            id: route.id,
            name: route.name,
            start_point: route.start_point,
            destination: route.destination,
            stops: route.stops,
            estimated_minutes: route.estimated_minutes,
          },
          { onConflict: "id" }
        );
        if (fallbackError) {
          throw new Error(`Failed to upsert route ${route.id}: ${fallbackError.message}`);
        }
      } else {
        throw new Error(`Failed to upsert route ${route.id}: ${error.message}`);
      }
    }
    console.log(`✓ Seeded route: ${route.id} (${route.name}) - ${route.stops.length} stoppages`);
  }

  // Update existing fleet buses to link with predefined routes
  const { data: buses } = await admin.from("buses").select("id, route, route_id");
  if (buses && buses.length > 0) {
    for (const bus of buses) {
      let targetRouteId = bus.route_id;
      if (!targetRouteId || !PREDEFINED_ROUTES.some((r) => r.id === targetRouteId)) {
        const lowerRoute = (bus.route || "").toLowerCase();
        if (lowerRoute.includes("flyover") && lowerRoute.includes("gec")) {
          targetRouteId = "CUET_STATION_FLYOVER_GEC";
        } else if (lowerRoute.includes("gec") && lowerRoute.includes("cuet") && lowerRoute.indexOf("station") < lowerRoute.indexOf("cuet")) {
          targetRouteId = "STATION_CUET_GEC";
        } else if (lowerRoute.includes("station") && lowerRoute.includes("cuet") && lowerRoute.indexOf("station") < lowerRoute.indexOf("cuet")) {
          targetRouteId = "STATION_CUET_BAHADDARHAT";
        } else if (lowerRoute.includes("gec")) {
          targetRouteId = "CUET_STATION_GEC";
        } else {
          targetRouteId = "CUET_STATION_DIRECT";
        }
      }

      const matchingRoute = PREDEFINED_ROUTES.find((r) => r.id === targetRouteId);
      if (matchingRoute) {
        await admin
          .from("buses")
          .update({
            route_id: matchingRoute.id,
            route: matchingRoute.name,
            stops: matchingRoute.stops,
          })
          .eq("id", bus.id);
      }
    }
    console.log(`✓ Synchronized ${buses.length} fleet buses with predefined routes.`);
  }

  console.log("Predefined routes seeding completed successfully.");
}

// If invoked directly from CLI
if (process.argv[1]?.includes("seed-routes.js")) {
  seedPredefinedRoutes()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Route seed error:", err);
      process.exit(1);
    });
}
