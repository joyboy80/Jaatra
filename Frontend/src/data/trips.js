import { buses } from "./buses.js";

const tripTemplates = [
  { suffix: "M1", departureTime: "07:30 AM", arrivalTime: "08:20 AM", routeShift: 0 },
  { suffix: "D1", departureTime: "10:00 AM", arrivalTime: "10:55 AM", routeShift: 2 },
  { suffix: "E1", departureTime: "04:30 PM", arrivalTime: "05:25 PM", routeShift: 0 },
];

function shiftedStops(stops, shift) {
  if (!shift) return stops;
  return stops.map((_, index) => stops[(index + shift) % stops.length]);
}

export const trips = buses.flatMap((bus) =>
  tripTemplates.map((trip, index) => {
    const stops = shiftedStops(bus.stops, trip.routeShift);
    const route = `${stops[0]} - ${stops[stops.length - 1]}`;

    return {
      id: `${bus.id}-${trip.suffix}`,
      busId: bus.id,
      busName: bus.name,
      busNumber: bus.number,
      busCategory: bus.type,
      capacity: bus.capacity,
      route,
      stops,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      status: index === 1 ? "Scheduled" : bus.status,
      driver: bus.assignedDriver,
    };
  })
);

export function getTripsForBus(busId) {
  return trips.filter((trip) => trip.busId === busId);
}
