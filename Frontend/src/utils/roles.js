export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  STAFF: "staff",
  DRIVER: "driver",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  [ROLES.STUDENT]: "Student",
  [ROLES.TEACHER]: "Teacher",
  [ROLES.STAFF]: "Staff",
  [ROLES.DRIVER]: "Driver",
  [ROLES.ADMIN]: "Transport Authority",
};

export const ROLE_DASHBOARDS = {
  [ROLES.STUDENT]: "/student/dashboard",
  [ROLES.TEACHER]: "/teacher/dashboard",
  [ROLES.STAFF]: "/staff/dashboard",
  [ROLES.DRIVER]: "/driver/dashboard",
  [ROLES.ADMIN]: "/admin/dashboard",
};

export const roleOptions = Object.values(ROLES).map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

export function getDashboardForRole(role) {
  return ROLE_DASHBOARDS[role] || "/login";
}
