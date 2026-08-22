import { ROLES } from "./roles.js";

export const busCategoriesByRole = {
  [ROLES.STUDENT]: ["Student Bus", "Female Student Bus"],
  [ROLES.TEACHER]: ["Teacher Bus"],
  [ROLES.STAFF]: ["Staff Bus"],
};

export function getAllowedBusCategories(role) {
  return busCategoriesByRole[role] || [];
}

export function getRoleBusLabel(role) {
  if (role === ROLES.TEACHER) return "Teacher buses";
  if (role === ROLES.STAFF) return "Staff buses";
  return "Student buses";
}

export function parseDepartureMinutes(value) {
  const [time, meridiem] = value.split(" ");
  const [hourText, minuteText] = time.split(":");
  let hour = Number(hourText);
  const minutes = Number(minuteText);

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  return hour * 60 + minutes;
}

export function uniqueValues(values) {
  return [...new Set(values)].sort();
}
