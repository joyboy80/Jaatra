export const registrationRoles = [
  { value: "STUDENT", label: "Student" },
  { value: "TEACHER", label: "Teacher" },
  { value: "STAFF", label: "Staff" },
  { value: "DRIVER", label: "Driver" },
];

export const departments = [
  ["01", "Civil Engineering"],
  ["02", "Electrical and Electronic Engineering"],
  ["03", "Mechanical Engineering"],
  ["04", "Computer Science and Engineering"],
  ["05", "Urban and Regional Planning"],
  ["06", "Architecture"],
  ["07", "Petroleum and Mining Engineering"],
  ["08", "Biomedical Engineering"],
  ["09", "Mechanical and Industrial Engineering"],
  ["10", "Materials and Metallurgical Engineering"],
  ["11", "Electronics and Telecommunication Engineering"],
  ["12", "Water Resources Engineering"],
].map(([value, label]) => ({ value, label }));

export const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];
