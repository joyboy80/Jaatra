import { getDashboardForRole, ROLE_LABELS, ROLES } from "../utils/roles.js";
import { apiRequest, backendEnabled } from "./api.js";

const STORAGE_KEY = "jaatra.auth";
const LEGACY_TRANSPORT_KEYS = [
  "jaatra.reservations",
  "jaatra.tickets",
  "jaatra.driver.operations",
  "jaatra.admin.buses",
  "jaatra.admin.routes",
  "jaatra.admin.schedules",
  "jaatra.admin.users",
  "jaatra.admin.drivers",
  "jaatra.admin.maintenance",
];

function clearLegacyTransportStorage() {
  if (!backendEnabled) return;
  LEGACY_TRANSPORT_KEYS.forEach((key) => localStorage.removeItem(key));
  Object.keys(localStorage)
    .filter((key) => key.startsWith("jaatra.notifications."))
    .forEach((key) => localStorage.removeItem(key));
}

function normalizeRole(profile) {
  const value = String(profile?.role || profile?.userType || "").toLowerCase();
  return value === "transport_admin" ? ROLES.ADMIN : value;
}

function makeUser(profile) {
  const role = normalizeRole(profile);
  const universityId = profile.studentId || profile.employeeId || profile.institutionalId || profile.id;
  return {
    id: profile.id,
    authUserId: profile.authUserId,
    universityId,
    name: profile.fullName || profile.name,
    email: profile.email,
    phone: profile.phone,
    role,
    roleLabel: ROLE_LABELS[role],
    gender: profile.gender,
    department: profile.department,
    profileImage: profile.profileImage,
    destination: getDashboardForRole(role),
  };
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

function storeAuth(authState) {
  clearStoredAuth();
  const safeState = backendEnabled
    ? { user: authState.user, remember: Boolean(authState.remember), expiresAt: authState.expiresAt }
    : authState;
  const storage = safeState.remember ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEY, JSON.stringify(safeState));
  return safeState;
}

const mockProfiles = {
  [ROLES.STUDENT]: {
    name: "Mahbubur Rahman",
    universityId: "STU-2026-0142",
    email: "mahbubur.rahman@university.edu",
  },
  [ROLES.TEACHER]: {
    name: "Dr. Nusrat Jahan",
    universityId: "FAC-2026-0031",
    email: "nusrat.jahan@university.edu",
  },
  [ROLES.STAFF]: {
    name: "Imran Chowdhury",
    universityId: "STF-2026-0087",
    email: "imran.chowdhury@university.edu",
  },
  [ROLES.DRIVER]: {
    name: "Mizan Rahman",
    universityId: "DRV-2026-0019",
    email: "mizan.rahman@university.edu",
  },
  [ROLES.ADMIN]: {
    name: "Transport Authority",
    universityId: "ADM-2026-0001",
    email: "transport.authority@university.edu",
  },
};

function makeAuthState({ profile, session, remember }) {
  return {
    user: makeUser(profile),
    expiresAt: session.expiresAt,
    remember: Boolean(remember),
  };
}

async function mockLogin({ identifier, password, role, remember }) {
  await new Promise((resolve) => setTimeout(resolve, 650));

  if (!identifier || !password) {
    throw new Error("Enter your university email or ID and password.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const safeRole = role || ROLES.STUDENT;
  const profile = mockProfiles[safeRole] || mockProfiles[ROLES.STUDENT];
  const user = {
    id: profile.universityId,
    universityId: profile.universityId,
    name: profile.name,
    email: identifier.includes("@") ? identifier : profile.email,
    role: safeRole,
    roleLabel: ROLE_LABELS[safeRole],
    destination: getDashboardForRole(safeRole),
  };

  const authState = {
    user,
    token: `mock-token-${safeRole}-${Date.now()}`,
    remember: Boolean(remember),
  };

  return storeAuth(authState);
}

export async function login(credentials) {
  if (!backendEnabled) return mockLogin(credentials);
  if (!credentials.identifier || !credentials.password) throw new Error("Enter your university email and password.");

  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: { email: credentials.identifier, password: credentials.password, remember: Boolean(credentials.remember) },
  });
  const authState = makeAuthState({ profile: result.user, session: result.session, remember: credentials.remember });
  return storeAuth(authState);
}

export async function register(input) {
  const result = await apiRequest("/auth/register", { method: "POST", body: input });
  if (!result.session) return result;
  const authState = makeAuthState({ profile: result.user, session: result.session, remember: true });
  storeAuth(authState);
  return { ...result, authState };
}

export async function sendOtp(email) {
  return apiRequest("/auth/send-otp", { method: "POST", body: { email } });
}

export async function verifyOtp(email, otp) {
  return apiRequest("/auth/verify-otp", { method: "POST", body: { email, otp } });
}

export async function forgotPassword(email) {
  return apiRequest("/auth/forgot-password", { method: "POST", body: { email } });
}

export async function resetPassword(accessToken, password, confirmPassword) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    token: accessToken,
    body: { password, confirmPassword },
  });
}

export async function refresh() {
  const current = getStoredAuth();
  if (!backendEnabled) return current;
  const result = await apiRequest("/auth/refresh", { method: "POST" });
  const authState = makeAuthState({ profile: result.user, session: result.session, remember: current?.remember });
  return storeAuth(authState);
}

export async function restoreSession() {
  const current = getStoredAuth();
  if (!backendEnabled) return current;
  clearLegacyTransportStorage();

  try {
    const result = await apiRequest("/auth/me");
    return storeAuth({ ...current, user: makeUser(result.user), remember: current?.remember });
  } catch (error) {
    if (error.status === 401) {
      try {
        return await refresh();
      } catch (_refreshError) {
        clearStoredAuth();
        return null;
      }
    }
    if (error.status === 401 || error.status === 403) {
      clearStoredAuth();
      return null;
    }
    clearStoredAuth();
    return null;
  }
}

export async function getCurrentUser() {
  const current = getStoredAuth();
  if (!backendEnabled) return current?.user || null;
  const result = await apiRequest("/auth/me");
  return makeUser(result.user);
}

export async function updateProfile(updates) {
  if (!backendEnabled) throw new Error("Backend authentication is not enabled.");
  return apiRequest("/auth/profile", { method: "PUT", body: updates });
}

export async function logout() {
  if (backendEnabled) {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (_error) {
      // Local logout must still complete when the network is unavailable.
    }
  }
  clearStoredAuth();
}

export function getStoredAuth() {
  try {
    const value = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch (_error) {
    clearStoredAuth();
    return null;
  }
}
