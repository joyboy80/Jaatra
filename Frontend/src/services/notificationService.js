import { apiRequest } from "./api.js";

export async function getNotifications(userId, role) {
  void userId;
  void role;
  return (await apiRequest("/transport/notifications")).notifications;
}

export async function markNotificationRead(userId, role, notificationId) {
  void userId;
  void role;
  return (await apiRequest(`/transport/notifications/${encodeURIComponent(notificationId)}/read`, { method: "PATCH" })).notifications;
}

export async function markAllNotificationsRead(userId, role) {
  void userId;
  void role;
  return (await apiRequest("/transport/notifications/read-all", { method: "PATCH" })).notifications;
}

export async function clearNotifications(userId, role) {
  void userId;
  void role;
  return (await apiRequest("/transport/notifications", { method: "DELETE" })).notifications;
}

export function subscribeToNotifications({ userId, role }, listener, onError) {
  let active = true;
  const poll = async () => {
    try {
      const data = await getNotifications(userId, role);
      if (active) listener(data);
    } catch (error) {
      if (active) onError?.(error);
    }
  };
  poll();
  const timer = typeof window !== "undefined" ? window.setInterval(poll, 10000) : null;
  return () => {
    active = false;
    if (timer) window.clearInterval(timer);
  };
}
