import AppError from "../utils/AppError.js";

export const ROLES = Object.freeze({
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
  STAFF: "STAFF",
  DRIVER: "DRIVER",
  TRANSPORT_ADMIN: "TRANSPORT_ADMIN",
});

export const DEPARTMENTS = Object.freeze({
  "01": "Civil Engineering",
  "02": "Electrical and Electronic Engineering",
  "03": "Mechanical Engineering",
  "04": "Computer Science and Engineering",
  "05": "Urban and Regional Planning",
  "06": "Architecture",
  "07": "Petroleum and Mining Engineering",
  "08": "Biomedical Engineering",
  "09": "Mechanical and Industrial Engineering",
  "10": "Materials and Metallurgical Engineering",
  "11": "Electronics and Telecommunication Engineering",
  "12": "Water Resources Engineering",
});

const PUBLIC_ROLES = new Set([ROLES.STUDENT, ROLES.TEACHER, ROLES.STAFF, ROLES.DRIVER]);
const GENDERS = new Set(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_EMAIL_PATTERN = /^u(\d{2})(0[1-9]|1[0-2])(\d{3})@student\.cuet\.ac\.bd$/i;
const PHONE_PATTERN = /^(?:\+?880|0)1[3-9]\d{8}$/;
const OTP_PATTERN = /^\d{6}$/;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function assertEmail(email) {
  if (!EMAIL_PATTERN.test(email)) throw new AppError(400, "Enter a valid email address.", "VALIDATION_ERROR");
}

function resolveDepartment(input = {}) {
  const submitted = text(input.departmentCode || input.department);
  const code = Object.hasOwn(DEPARTMENTS, submitted)
    ? submitted
    : Object.entries(DEPARTMENTS).find(([, name]) => name.toLowerCase() === submitted.toLowerCase())?.[0];
  if (!code) throw new AppError(400, "Select a valid CUET department.", "INVALID_DEPARTMENT");
  return { departmentCode: code, departmentName: DEPARTMENTS[code] };
}

function validatePassword(password, confirmPassword) {
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw new AppError(400, "Password must be at least 8 characters and include uppercase, lowercase, and a number.", "WEAK_PASSWORD");
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new AppError(400, "Password and confirmation do not match.", "PASSWORD_MISMATCH");
  }
}

export function validateRegistration(input = {}) {
  const email = text(input.email).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";
  const fullName = text(input.fullName);
  const userType = text(input.userType || input.role).toUpperCase();
  const gender = text(input.gender).toUpperCase() || "PREFER_NOT_TO_SAY";
  const phone = text(input.phone).replace(/[\s()-]/g, "");
  const { departmentCode, departmentName } = resolveDepartment(input);

  assertEmail(email);
  validatePassword(password, Object.hasOwn(input, "confirmPassword") ? input.confirmPassword : undefined);
  if (fullName.length < 2 || fullName.length > 120) throw new AppError(400, "Full name must contain 2 to 120 characters.", "VALIDATION_ERROR");
  if (userType === ROLES.TRANSPORT_ADMIN || userType === "ADMIN") {
    throw new AppError(403, "Transport Admin accounts cannot be created through public registration.", "ADMIN_REGISTRATION_FORBIDDEN");
  }
  if (!PUBLIC_ROLES.has(userType)) throw new AppError(400, "Select a supported registration user type.", "VALIDATION_ERROR");
  if (!GENDERS.has(gender)) throw new AppError(400, "Select a supported gender value.", "VALIDATION_ERROR");
  if (!PHONE_PATTERN.test(phone)) throw new AppError(400, "Enter a valid Bangladesh mobile number.", "INVALID_PHONE");

  let studentId = null;
  let institutionalId = null;
  if (userType === ROLES.STUDENT) {
    const match = email.match(STUDENT_EMAIL_PATTERN);
    if (!match) throw new AppError(400, "Use a valid CUET student email such as u2204094@student.cuet.ac.bd.", "INVALID_STUDENT_EMAIL");
    const [, , emailDepartmentCode, emailStudentId] = match;
    studentId = text(input.studentId);
    if (!/^\d{3}$/.test(studentId)) throw new AppError(400, "Student ID must contain exactly 3 digits.", "INVALID_STUDENT_ID");
    if (emailDepartmentCode !== departmentCode) throw new AppError(400, "The selected department does not match the student email.", "DEPARTMENT_MISMATCH");
    if (emailStudentId !== studentId) throw new AppError(400, "Student ID does not match the student email.", "STUDENT_ID_MISMATCH");
    institutionalId = email.slice(0, email.indexOf("@"));
  }

  return {
    email,
    password,
    fullName,
    userType,
    gender,
    phone,
    studentId,
    institutionalId,
    departmentCode,
    departmentName,
  };
}

export function validateLogin(input = {}) {
  const email = text(input.email).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";
  assertEmail(email);
  if (!password) throw new AppError(400, "Password is required.", "VALIDATION_ERROR");
  return { email, password };
}

export function validateRefresh(input = {}) {
  const refreshToken = text(input.refreshToken || input.refresh_token);
  if (!refreshToken) throw new AppError(400, "Refresh token is required.", "VALIDATION_ERROR");
  return { refreshToken };
}

export function validateOtpRequest(input = {}) {
  const email = text(input.email).toLowerCase();
  assertEmail(email);
  return { email };
}

export function validateOtpVerification(input = {}) {
  const { email } = validateOtpRequest(input);
  const otp = text(input.otp || input.code);
  if (!OTP_PATTERN.test(otp)) throw new AppError(400, "Enter the 6-digit verification code.", "INVALID_OTP_FORMAT");
  return { email, otp };
}

export function validateForgotPassword(input = {}) {
  const email = text(input.email).toLowerCase();
  assertEmail(email);
  return { email };
}

export function validateResetPassword(input = {}) {
  const password = typeof input.password === "string" ? input.password : "";
  validatePassword(password, Object.hasOwn(input, "confirmPassword") ? input.confirmPassword : undefined);
  return { password };
}

export function validateProfileUpdate(input = {}) {
  const forbidden = new Set([
    "role", "userType", "user_type", "authUserId", "auth_user_id", "email", "isVerified", "is_verified",
    "isActive", "is_active", "approvalStatus", "approval_status", "registrationStatus", "registration_status",
    "department", "departmentCode", "department_code", "departmentName", "department_name", "institutionalId",
    "institutional_id", "studentId", "student_id",
  ]);
  if (Object.keys(input).some((field) => forbidden.has(field))) {
    throw new AppError(403, "Identity, role, verification, department, and account-status fields cannot be changed here.", "PROFILE_FIELD_FORBIDDEN");
  }

  const updates = {};
  if (Object.hasOwn(input, "fullName")) updates.full_name = text(input.fullName);
  if (Object.hasOwn(input, "phone")) updates.phone = text(input.phone).replace(/[\s()-]/g, "") || null;
  if (Object.hasOwn(input, "profileImage")) {
    const profileImage = text(input.profileImage);
    if (profileImage && (profileImage.length > 2048 || !/^https?:\/\//i.test(profileImage))) {
      throw new AppError(400, "Profile image must be a valid HTTP(S) URL.", "INVALID_PROFILE_IMAGE");
    }
    updates.profile_image = profileImage || null;
  }

  if (!Object.keys(updates).length) throw new AppError(400, "No supported profile fields were provided.", "VALIDATION_ERROR");
  if (updates.full_name !== undefined && (updates.full_name.length < 2 || updates.full_name.length > 120)) {
    throw new AppError(400, "Full name must contain 2 to 120 characters.", "VALIDATION_ERROR");
  }
  if (updates.phone && !PHONE_PATTERN.test(updates.phone)) throw new AppError(400, "Enter a valid Bangladesh mobile number.", "INVALID_PHONE");
  return updates;
}
