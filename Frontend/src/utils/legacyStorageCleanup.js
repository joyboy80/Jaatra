const LEGACY_LOCAL_KEYS = [
  "safar.auth",
  "safar.reservations",
  "safar.tickets",
  "safar.driver.operations",
  "safar.admin.buses",
  "safar.admin.routes",
  "safar.admin.schedules",
  "safar.admin.users",
  "safar.admin.drivers",
  "safar.admin.maintenance",
];

const LEGACY_LOCAL_PREFIXES = [
  "safar.notifications.",
  "safar.ai.conversation.",
];

export function cleanupLegacyDemoStorage() {
  if (typeof window === "undefined") return;

  LEGACY_LOCAL_KEYS.forEach((key) => window.localStorage.removeItem(key));
  Object.keys(window.localStorage)
    .filter((key) => LEGACY_LOCAL_PREFIXES.some((prefix) => key.startsWith(prefix)))
    .forEach((key) => window.localStorage.removeItem(key));
  window.sessionStorage.removeItem("safar.auth");
}
