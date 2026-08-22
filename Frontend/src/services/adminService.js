import { apiRequest } from "./api.js";

const scheduleTypes = ["Regular", "Weekend", "Holiday", "Exam", "Special Event"];

export async function getAdminBuses() {
  return (await apiRequest("/admin/transport/buses")).buses;
}

export async function saveBus(input) {
  return (await apiRequest("/admin/transport/buses", { method: "PUT", body: input })).bus;
}

export async function deleteBus(id) {
  return apiRequest(`/admin/transport/buses/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getAdminRoutes() {
  return (await apiRequest("/admin/transport/routes")).routes;
}

export async function saveRoute(input) {
  return (await apiRequest("/admin/transport/routes", { method: "PUT", body: input })).route;
}

export async function deleteRoute(id) {
  return apiRequest(`/admin/transport/routes/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getAdminSchedules() {
  return (await apiRequest("/admin/transport/schedules")).schedules;
}

export async function saveSchedule(input) {
  return (await apiRequest("/admin/transport/schedules", { method: "PUT", body: input })).schedule;
}

export async function deleteSchedule(id) {
  return apiRequest(`/admin/transport/schedules/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getAdminAssignments() {
  return (await apiRequest("/admin/transport/assignments")).assignments;
}

export async function saveAssignment(input) {
  return (await apiRequest("/admin/transport/assignments", { method: "PUT", body: input })).assignment;
}

export async function cancelAssignment(id) {
  return apiRequest(`/admin/transport/assignments/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getAdminReservations() {
  return (await apiRequest("/admin/transport/reservations")).reservations;
}

export async function getAdminUsers() {
  return (await apiRequest("/admin/transport/users")).users;
}

export async function updateUser(id, updates) {
  return (await apiRequest(`/admin/transport/users/${encodeURIComponent(id)}`, { method: "PUT", body: updates })).user;
}

export async function getAdminDrivers() {
  return (await apiRequest("/admin/transport/drivers")).drivers;
}

export async function updateDriver(id, updates) {
  return (await apiRequest(`/admin/transport/drivers/${encodeURIComponent(id)}`, { method: "PUT", body: updates })).driver;
}

export async function getMaintenanceRecords() {
  return (await apiRequest("/admin/transport/maintenance")).maintenance;
}

export async function updateMaintenance(id, updates) {
  return (await apiRequest(`/admin/transport/maintenance/${encodeURIComponent(id)}`, { method: "PUT", body: updates })).maintenance;
}

export async function getOperationalAlerts() {
  return (await apiRequest("/admin/transport/alerts")).alerts;
}

export async function getAdminOverview() {
  return (await apiRequest("/admin/transport/overview")).overview;
}

export async function getAnalytics() {
  return (await apiRequest("/admin/transport/analytics")).analytics;
}

export { scheduleTypes };
