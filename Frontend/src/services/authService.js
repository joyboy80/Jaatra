import { getDashboardForRole, ROLE_LABELS, ROLES } from "../utils/roles.js";

const STORAGE_KEY = "jaatra.auth";

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

export async function login({ identifier, password, role, remember }) {
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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  return authState;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (_error) {
    return null;
  }
}
