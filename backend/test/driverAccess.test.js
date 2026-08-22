import assert from "node:assert/strict";
import test from "node:test";
import { assertProfilePortalAccess } from "../src/utils/driverAccess.js";
import { normalizeDriverEmail, validateDriverForAssignment } from "../src/services/transportService.js";

const driver = { id: "driver-profile", email: "driver@example.com", user_type: "DRIVER", is_verified: true, is_active: true, approval_status: "PENDING" };

test("a verified active Driver has immediate portal access without Transport Admin approval", () => {
  assert.equal(assertProfilePortalAccess(driver), driver);
});

test("unverified and inactive Driver accounts remain denied", () => {
  assert.throws(() => assertProfilePortalAccess({ ...driver, is_verified: false }), (error) => error.code === "EMAIL_NOT_VERIFIED");
  assert.throws(() => assertProfilePortalAccess({ ...driver, is_active: false }), (error) => error.code === "ACCOUNT_INACTIVE");
});

test("assignment accepts a registered verified active Driver regardless of approval status", () => {
  assert.equal(validateDriverForAssignment(driver).id, "driver-profile");
  assert.equal(normalizeDriverEmail("  DRIVER@EXAMPLE.COM "), "driver@example.com");
});

test("assignment distinguishes unknown, non-Driver, unverified, and inactive emails", () => {
  assert.throws(() => validateDriverForAssignment(null), (error) => error.code === "DRIVER_EMAIL_NOT_FOUND");
  assert.throws(() => validateDriverForAssignment({ ...driver, user_type: "STAFF" }), (error) => error.code === "NOT_A_DRIVER");
  assert.throws(() => validateDriverForAssignment({ ...driver, is_verified: false }), (error) => error.code === "DRIVER_NOT_VERIFIED");
  assert.throws(() => validateDriverForAssignment({ ...driver, is_active: false }), (error) => error.code === "DRIVER_INACTIVE");
});
