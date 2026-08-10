import { buses } from "../data/buses.js";

const listeners = new Set();
let timer = null;
let tick = 0;

const initialStatuses = ["Running", "Running", "On Time", "Delayed", "Running", "Maintenance", "Running", "Offline", "Running", "On Time", "Completed", "Running"];

let liveBuses = buses.map((bus, index) => ({
  id: bus.id,
  name: bus.name,
  busNumber: bus.number,
  category: bus.type,
  route: bus.route,
  stops: bus.stops,
  currentLocation: { ...bus.currentLocation },
  nextStop: bus.nextStop,
  etaMinutes: Number.parseInt(bus.eta, 10) || 10,
  speed: initialStatuses[index % initialStatuses.length] === "Running" ? 28 + (index % 16) : 0,
  status: initialStatuses[index % initialStatuses.length],
  delayMinutes: initialStatuses[index % initialStatuses.length] === "Delayed" ? 10 : 0,
  assignedDriver: bus.assignedDriver,
  capacity: bus.capacity,
  availableSeats: bus.availableSeats,
  progress: (index * 0.073) % 1,
  updatedAt: new Date().toISOString(),
}));

function snapshot() {
  return liveBuses.map((bus) => ({ ...bus, currentLocation: { ...bus.currentLocation } }));
}

function emit() {
  const next = snapshot();
  listeners.forEach((listener) => listener(next));
}

export function simulateTrackingStep() {
  tick += 1;
  liveBuses = liveBuses.map((bus, index) => {
    if (["Maintenance", "Offline", "Completed"].includes(bus.status)) return bus;

    const nextProgress = (bus.progress + 0.012 + (index % 4) * 0.002) % 1;
    const wave = Math.sin((nextProgress + index * 0.11) * Math.PI * 2);
    let status = bus.status;
    let delayMinutes = bus.delayMinutes;

    if (index === 3 && tick % 6 === 0) {
      status = status === "Delayed" ? "Running" : "Delayed";
      delayMinutes = status === "Delayed" ? 10 : 0;
    } else if (status === "On Time" && tick > 1) {
      status = "Running";
    }

    const speed = status === "Delayed" ? 12 + (index % 5) : 26 + ((tick + index * 3) % 19);
    const etaMinutes = Math.max(2, (bus.etaMinutes - 1 + (status === "Delayed" ? 2 : 0)) % 28 || 16);

    return {
      ...bus,
      progress: nextProgress,
      status,
      delayMinutes,
      speed,
      etaMinutes,
      currentLocation: {
        label: `${bus.nextStop} Road`,
        lat: 23.745 + nextProgress * 0.07 + wave * 0.004,
        lng: 90.382 + nextProgress * 0.055 + Math.cos(index + tick * 0.15) * 0.003,
      },
      updatedAt: new Date().toISOString(),
    };
  });
  emit();
  return snapshot();
}

function startSimulator() {
  if (timer || typeof window === "undefined") return;
  timer = window.setInterval(simulateTrackingStep, 3000);
}

function stopSimulator() {
  if (!timer || listeners.size > 0 || typeof window === "undefined") return;
  window.clearInterval(timer);
  timer = null;
}

export function subscribeToTracking(listener) {
  listeners.add(listener);
  listener(snapshot());
  startSimulator();
  return () => {
    listeners.delete(listener);
    stopSimulator();
  };
}

export function getTrackingSnapshot() {
  return snapshot();
}

export async function getLiveLocations() {
  return snapshot();
}

export async function getLiveBus(busId) {
  return snapshot().find((bus) => bus.id === busId) || null;
}

export function setLiveBusStatus(busId, status, delayMinutes = 0) {
  liveBuses = liveBuses.map((bus) => bus.id === busId ? { ...bus, status, delayMinutes, updatedAt: new Date().toISOString() } : bus);
  emit();
}
