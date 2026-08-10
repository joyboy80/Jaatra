import { notifications as notificationDefaults } from "../data/notifications.js";

const STORAGE_PREFIX = "jaatra.notifications";
const subscribers = new Map();
const timers = new Map();
const templateCursor = new Map();

const templates = [
  { type: "arrival", title: "Bus arriving", message: (bus) => `${bus} will arrive at your stop in 5 minutes.`, tone: "info" },
  { type: "delay", title: "Bus delayed", message: (bus) => `${bus} is delayed by 10 minutes.`, tone: "danger" },
  { type: "seat", title: "Seat availability", message: () => "Only 3 seats remain on Padma.", tone: "warning" },
  { type: "schedule", title: "Schedule updated", message: () => "Your bus schedule has been updated.", tone: "info" },
];

function keyFor(userId) {
  return `${STORAGE_PREFIX}.${userId}`;
}

function readJson(key, fallback) {
  if (typeof localStorage === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_error) { return fallback; }
}

function writeJson(key, value) {
  if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function nowLabel() {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());
}

function seededNotifications(userId, role) {
  return notificationDefaults.filter((item) => item.role === role).map((item) => ({ ...item, userId }));
}

function readNotifications(userId, role) {
  return readJson(keyFor(userId), seededNotifications(userId, role));
}

function publish(userId, role, notifications) {
  writeJson(keyFor(userId), notifications);
  subscribers.get(userId)?.forEach((listener) => listener(notifications));
  return notifications;
}

function preferredBus(userId, role) {
  const reservations = readJson("jaatra.reservations", []);
  return reservations.find((item) => item.userId === userId && item.status === "Confirmed")?.busName || (role === "teacher" ? "Padma" : role === "staff" ? "Jamuna" : "Surma");
}

export async function getNotifications(userId, role) {
  return readNotifications(userId, role);
}

export function createNotification(userId, role, input) {
  if (!userId) return null;
  const notification = {
    id: `NTF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    userId,
    role,
    type: input.type || "transport",
    title: input.title,
    message: input.message,
    tone: input.tone || "info",
    unread: true,
    time: nowLabel(),
    createdAt: new Date().toISOString(),
  };
  publish(userId, role, [notification, ...readNotifications(userId, role)]);
  return notification;
}

export async function markNotificationRead(userId, role, notificationId) {
  return publish(userId, role, readNotifications(userId, role).map((item) => item.id === notificationId ? { ...item, unread: false } : item));
}

export async function markAllNotificationsRead(userId, role) {
  return publish(userId, role, readNotifications(userId, role).map((item) => ({ ...item, unread: false })));
}

export async function clearNotifications(userId, role) {
  return publish(userId, role, []);
}

function simulateNotification(userId, role) {
  const index = templateCursor.get(userId) || 0;
  const template = templates[index % templates.length];
  templateCursor.set(userId, index + 1);
  createNotification(userId, role, {
    type: template.type,
    title: template.title,
    message: template.message(preferredBus(userId, role)),
    tone: template.tone,
  });
}

export function subscribeToNotifications({ userId, role }, listener) {
  if (!subscribers.has(userId)) subscribers.set(userId, new Set());
  subscribers.get(userId).add(listener);
  listener(readNotifications(userId, role));

  if (!timers.has(userId) && typeof window !== "undefined" && ["student", "teacher", "staff"].includes(role)) {
    timers.set(userId, window.setInterval(() => simulateNotification(userId, role), 12000));
  }

  return () => {
    const userSubscribers = subscribers.get(userId);
    userSubscribers?.delete(listener);
    if (userSubscribers?.size === 0) {
      subscribers.delete(userId);
      if (timers.has(userId) && typeof window !== "undefined") window.clearInterval(timers.get(userId));
      timers.delete(userId);
    }
  };
}

export { simulateNotification };
