import { occupancyPredictions, smartInsightDefaults } from "../data/aiInsights.js";

export async function getOccupancyPredictions() {
  return occupancyPredictions.map((prediction) => ({ ...prediction }));
}

export async function getSmartTransportationInsights() {
  return smartInsightDefaults.map((insight) => ({ ...insight }));
}

export async function predictBusOccupancy(busId) {
  return occupancyPredictions.find((prediction) => prediction.busId === busId) || null;
}
