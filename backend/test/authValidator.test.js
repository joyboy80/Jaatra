import assert from "node:assert/strict";
import test from "node:test";
import {
  DEPARTMENTS,
  validateForgotPassword,
  validateOtpVerification,
  validateProfileUpdate,
  validateRegistration,
  validateResetPassword,
} from "../src/validators/authValidator.js";

const validStudent = {
  email: "u2204094@student.cuet.ac.bd",
  password: "SecurePass1",
  confirmPassword: "SecurePass1",
  fullName: "Mahbubur Rahman",
  userType: "student",
  phone: "01712345678",
  studentId: "094",
  departmentCode: "04",
};

test("student registration derives trusted department and institutional identity", () => {
  const result = validateRegistration(validStudent);
  assert.equal(result.email, "u2204094@student.cuet.ac.bd");
  assert.equal(result.userType, "STUDENT");
  assert.equal(result.departmentName, DEPARTMENTS["04"]);
  assert.equal(result.institutionalId, "u2204094");
  assert.equal(result.studentId, "094");
});

test("student department must match the email", () => {
  assert.throws(
    () => validateRegistration({ ...validStudent, departmentCode: "03" }),
    (error) => error.code === "DEPARTMENT_MISMATCH",
  );
});

test("student ID must match the email", () => {
  assert.throws(
    () => validateRegistration({ ...validStudent, studentId: "095" }),
    (error) => error.code === "STUDENT_ID_MISMATCH",
  );
});

test("random student subdomain addresses are rejected", () => {
  assert.throws(
    () => validateRegistration({ ...validStudent, email: "random@student.cuet.ac.bd" }),
    (error) => error.code === "INVALID_STUDENT_EMAIL",
  );
});

test("teacher, staff, and driver registration accepts any valid email provider", () => {
  for (const [userType, email] of [
    ["TEACHER", "teacher@gmail.com"],
    ["STAFF", "staff@outlook.com"],
    ["DRIVER", "driver@yahoo.com"],
  ]) {
    const result = validateRegistration({
      email,
      password: "SecurePass1",
      fullName: `${userType} User`,
      userType,
      phone: "+8801712345678",
      department: "Computer Science and Engineering",
    });
    assert.equal(result.email, email);
    assert.equal(result.userType, userType);
    assert.equal(result.departmentCode, "04");
  }
});

test("public registration cannot create a Transport Admin with either role spelling", () => {
  for (const userType of ["TRANSPORT_ADMIN", "ADMIN"]) {
    assert.throws(
      () => validateRegistration({ ...validStudent, userType }),
      (error) => error.statusCode === 403 && error.code === "ADMIN_REGISTRATION_FORBIDDEN",
    );
  }
});

test("password policy requires uppercase, lowercase, and a number", () => {
  assert.throws(() => validateRegistration({ ...validStudent, password: "weakpass", confirmPassword: "weakpass" }), (error) => error.code === "WEAK_PASSWORD");
});

test("self-service profile updates reject privileged fields", () => {
  for (const update of [{ userType: "TRANSPORT_ADMIN" }, { is_verified: true }, { approvalStatus: "APPROVED" }, { departmentCode: "01" }]) {
    assert.throws(() => validateProfileUpdate(update), (error) => error.statusCode === 403);
  }
});

test("profile update accepts only safe fields", () => {
  assert.deepEqual(validateProfileUpdate({ fullName: "Updated Name", phone: "01712345678", profileImage: "https://example.com/a.jpg" }), {
    full_name: "Updated Name",
    phone: "01712345678",
    profile_image: "https://example.com/a.jpg",
  });
});

test("forgot-password accepts registered email providers", () => {
  assert.equal(validateForgotPassword({ email: "joy@cuet.ac.bd" }).email, "joy@cuet.ac.bd");
  assert.equal(validateForgotPassword({ email: validStudent.email }).email, validStudent.email);
  assert.equal(validateForgotPassword({ email: "teacher@gmail.com" }).email, "teacher@gmail.com");
});

test("OTP verification requires exactly six numeric digits", () => {
  assert.deepEqual(validateOtpVerification({ email: validStudent.email, otp: "123456" }), {
    email: validStudent.email,
    otp: "123456",
  });
  assert.throws(() => validateOtpVerification({ email: validStudent.email, otp: "12345" }), /6-digit/);
  assert.throws(() => validateOtpVerification({ email: validStudent.email, otp: "12A456" }), /6-digit/);
});

test("password reset applies the strong password policy", () => {
  assert.deepEqual(validateResetPassword({ password: "SecurePass1", confirmPassword: "SecurePass1" }), { password: "SecurePass1" });
  assert.throws(() => validateResetPassword({ password: "weakpass", confirmPassword: "weakpass" }), /uppercase/);
  assert.throws(() => validateResetPassword({ password: "SecurePass1", confirmPassword: "SecurePass2" }), /do not match/);
});
