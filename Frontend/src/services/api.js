const configuredUrl = import.meta.env.VITE_API_URL?.trim() || "";

export const backendEnabled = Boolean(configuredUrl);
export const API_BASE_URL = configuredUrl.replace(/\/$/, "");
let refreshRequest = null;

function notifySessionExpired() {
  localStorage.removeItem("jaatra.auth");
  sessionStorage.removeItem("jaatra.auth");
  window.dispatchEvent(new Event("jaatra:session-expired"));
}

function refreshSession() {
  refreshRequest ||= fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  }).finally(() => {
    refreshRequest = null;
  });
  return refreshRequest;
}

export async function apiRequest(path, { method = "GET", body, token, signal, retryOnUnauthorized = true } = {}) {
  if (!backendEnabled) throw new Error("The Jaatra backend is not configured. Set VITE_API_URL.");

  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    method,
    signal,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 401 && retryOnUnauthorized && !path.startsWith("/auth/")) {
    const refreshed = await refreshSession();
    if (refreshed.ok) return apiRequest(path, { method, body, token, signal, retryOnUnauthorized: false });
    notifySessionExpired();
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.error?.message || `Request failed with status ${response.status}.`);
    error.status = response.status;
    error.code = payload?.error?.code || "API_ERROR";
    error.details = payload?.error?.details;
    throw error;
  }

  return payload?.data;
}
