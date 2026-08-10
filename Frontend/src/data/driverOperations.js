import { buses } from "./buses.js";
import { getTripsForBus } from "./trips.js";
import { toDateInputValue } from "../utils/date.js";

export const driverProfile = {
  id: "DRV-2026-0019",
  name: "Mizan Rahman",
  phone: "+880 1711 458920",
};

export const assignedBus = buses.find((bus) => bus.assignedDriver === driverProfile.name) || buses[0];

export function getDriverTrips() {
  const today = toDateInputValue(new Date());

  return getTripsForBus(assignedBus.id).map((trip, index) => ({
    ...trip,
    date: today,
    status: index === 0 ? "Boarding" : "Upcoming",
    currentLocation: assignedBus.currentLocation.label,
    nextStop: assignedBus.nextStop,
    eta: assignedBus.eta,
  }));
}

export const seededPassengers = [
  { ticketId: "TKT-DEMO-1001", passengerName: "Ayesha Siddika", universityId: "STU-2026-0110", roleLabel: "Student", seatNumber: "1A", boardingStatus: "Boarded" },
  { ticketId: "TKT-DEMO-1002", passengerName: "Nabila Islam", universityId: "STU-2026-0124", roleLabel: "Student", seatNumber: "1B", boardingStatus: "Boarded" },
  { ticketId: "TKT-DEMO-1003", passengerName: "Samia Rahman", universityId: "STU-2026-0148", roleLabel: "Student", seatNumber: "2A", boardingStatus: "Boarded" },
  { ticketId: "TKT-DEMO-1004", passengerName: "Farzana Haque", universityId: "STU-2026-0161", roleLabel: "Student", seatNumber: "2B", boardingStatus: "Not Boarded" },
  { ticketId: "TKT-DEMO-1005", passengerName: "Raisa Karim", universityId: "STU-2026-0193", roleLabel: "Student", seatNumber: "3A", boardingStatus: "Not Boarded" },
  { ticketId: "TKT-DEMO-1006", passengerName: "Tasnim Ahmed", universityId: "STU-2026-0207", roleLabel: "Student", seatNumber: "3B", boardingStatus: "Not Boarded" },
  { ticketId: "TKT-DEMO-1007", passengerName: "Maliha Noor", universityId: "STU-2026-0225", roleLabel: "Student", seatNumber: "4A", boardingStatus: "Not Boarded" },
  { ticketId: "TKT-DEMO-1008", passengerName: "Nusrat Chowdhury", universityId: "STU-2026-0250", roleLabel: "Student", seatNumber: "4B", boardingStatus: "Cancelled", ticketStatus: "Cancelled" },
];
