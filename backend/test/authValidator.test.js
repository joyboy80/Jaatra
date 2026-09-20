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
};

test("student registration derives trusted department, batch, student ID, and institutional identity", () => {
  const result = validateRegistration(validStudent);
  assert.equal(result.email, "u2204094@student.cuet.ac.bd");
  assert.equal(result.userType, "STUDENT");
  assert.equal(result.batch, "2022");
  assert.equal(result.departmentCode, "04");
  assert.equal(result.departmentName, DEPARTMENTS["04"]);
  assert.equal(result.institutionalId, "u2204094");
  assert.equal(result.studentId, "094");
});

test("student registration parses standard u<batch><dept><id>@cuet.ac.bd format", () => {
  const result = validateRegistration({
    ...validStudent,
    email: "u2204012@cuet.ac.bd",
  });
  assert.equal(result.email, "u2204012@cuet.ac.bd");
  assert.equal(result.batch, "2022");
  assert.equal(result.departmentCode, "04");
  assert.equal(result.departmentName, "Computer Science and Engineering");
  assert.equal(result.studentId, "012");
  assert.equal(result.institutionalId, "u2204012");
});

test("student registration correctly maps various departments and batches", () => {
  const civil = validateRegistration({ ...validStudent, email: "u2101050@cuet.ac.bd" });
  assert.equal(civil.batch, "2021");
  assert.equal(civil.departmentCode, "01");
  assert.equal(civil.departmentName, "Civil Engineering");
  assert.equal(civil.studentId, "050");

  const water = validateRegistration({ ...validStudent, email: "u2312001@cuet.ac.bd" });
  assert.equal(water.batch, "2023");
  assert.equal(water.departmentCode, "12");
  assert.equal(water.departmentName, "Water Resources Engineering");
  assert.equal(water.studentId, "001");
});

test("student email with invalid department code is rejected", () => {
  assert.throws(
    () => validateRegistration({ ...validStudent, email: "u2213012@cuet.ac.bd" }),
    (error) => error.code === "INVALID_DEPARTMENT_CODE",
  );
  assert.throws(
    () => validateRegistration({ ...validStudent, email: "u2200012@cuet.ac.bd" }),
    (error) => error.code === "INVALID_DEPARTMENT_CODE",
  );
});

test("client-submitted department and student ID are ignored in favor of verified email derivation", () => {
  const result = validateRegistration({
    ...validStudent,
    email: "u2204012@cuet.ac.bd",
    departmentCode: "01",
    studentId: "999",
    batch: "1990",
  });
  assert.equal(result.batch, "2022");
  assert.equal(result.departmentCode, "04");
  assert.equal(result.departmentName, "Computer Science and Engineering");
  assert.equal(result.studentId, "012");
});

test("malformed student email addresses are rejected", () => {
  assert.throws(
    () => validateRegistration({ ...validStudent, email: "random@student.cuet.ac.bd" }),
    (error) => error.code === "INVALID_STUDENT_EMAIL",
  );
  assert.throws(
    () => validateRegistration({ ...validStudent, email: "u220401@cuet.ac.bd" }),
    (error) => error.code === "INVALID_STUDENT_EMAIL",
  );
});

test("teacher registration does not require department, batch, or student ID", () => {
  for (const email of ["teacher@cuet.ac.bd", "teacher@gmail.com"]) {
    const result = validateRegistration({
      email,
      password: "SecurePass1",
      fullName: "Teacher User",
      userType: "TEACHER",
      phone: "+8801712345678",
    });
    assert.equal(result.email, email);
    assert.equal(result.userType, "TEACHER");
    assert.equal(result.departmentCode, null);
    assert.equal(result.departmentName, null);
    assert.equal(result.batch, null);
    assert.equal(result.studentId, null);
  }
});

test("staff and driver registration accept any valid email provider without student fields", () => {
  for (const [userType, email] of [
    ["STAFF", "staff@outlook.com"],
    ["DRIVER", "driver@yahoo.com"],
  ]) {
    const result = validateRegistration({
      email,
      password: "SecurePass1",
      fullName: `${userType} User`,
      userType,
      phone: "+8801712345678",
    });
    assert.equal(result.email, email);
    assert.equal(result.userType, userType);
    assert.equal(result.departmentCode, null);
    assert.equal(result.departmentName, null);
    assert.equal(result.batch, null);
    assert.equal(result.studentId, null);
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
