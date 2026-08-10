const names = [
  "Surma",
  "Meghna",
  "Padma",
  "Jamuna",
  "Brahmaputra",
  "Karnaphuli",
  "Teesta",
  "Madhumati",
  "Atrai",
  "Buriganga",
  "Shitalakshya",
  "Dhaleshwari",
  "Rupsa",
  "Pasur",
  "Sangu",
  "Halda",
  "Gorai",
  "Kushiyara",
];

const categories = ["Student Bus", "Female Student Bus", "Teacher Bus", "Staff Bus"];
const statuses = ["On Time", "Boarding", "En Route", "Delayed", "Arrived"];
const hubs = [
  "Main Campus",
  "Science Annex",
  "Central Library",
  "Medical Gate",
  "North Hall",
  "South Hall",
  "Faculty Quarter",
  "Transport Yard",
];

const drivers = [
  "Abdul Karim",
  "Mizan Rahman",
  "Farhana Akter",
  "Sabbir Hossain",
  "Nusrat Jahan",
  "Imran Chowdhury",
];

export const buses = names.map((name, index) => {
  const routeStart = hubs[index % hubs.length];
  const routeEnd = hubs[(index + 3) % hubs.length];
  const departureHour = 7 + (index % 6);
  const capacity = index % 4 === 1 ? 36 : index % 4 === 2 ? 28 : 44;

  return {
    id: `BUS-${String(index + 1).padStart(3, "0")}`,
    name,
    number: `JA-${2020 + index}`,
    type: categories[index % categories.length],
    capacity,
    route: `${routeStart} - ${routeEnd}`,
    stops: [
      routeStart,
      hubs[(index + 1) % hubs.length],
      hubs[(index + 2) % hubs.length],
      routeEnd,
    ],
    departureTime: `${String(departureHour).padStart(2, "0")}:15 AM`,
    arrivalTime: `${String(departureHour + 1).padStart(2, "0")}:05 AM`,
    availableSeats: Math.max(4, capacity - 12 - (index % 11)),
    status: statuses[index % statuses.length],
    nextStop: hubs[(index + 1) % hubs.length],
    eta: `${6 + (index % 18)} min`,
    currentLocation: {
      label: `${hubs[(index + 2) % hubs.length]} Road`,
      lat: 23.74 + index * 0.004,
      lng: 90.38 + index * 0.003,
    },
    assignedDriver: drivers[index % drivers.length],
  };
});

export const busStats = {
  total: buses.length,
  active: buses.filter((bus) => bus.status !== "Arrived").length,
  availableSeats: buses.reduce((sum, bus) => sum + bus.availableSeats, 0),
  delayed: buses.filter((bus) => bus.status === "Delayed").length,
};
