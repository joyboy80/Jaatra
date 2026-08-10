import assert from "node:assert/strict";
import test from "node:test";
import { env } from "../src/config/env.js";
import { hashOtp, verifyOtpHash } from "../src/services/otpCrypto.js";

env.otpHashSecret = "unit-test-secret-that-is-longer-than-thirty-two-characters";

test("OTP storage uses a salted hash and never contains the plaintext code", () => {
  const email = "u2204094@student.cuet.ac.bd";
  const stored = hashOtp(email, "123456");
  assert.equal(stored.includes("123456"), false);
  assert.equal(verifyOtpHash(email, "123456", stored), true);
  assert.equal(verifyOtpHash(email, "654321", stored), false);
  assert.equal(verifyOtpHash("another@cuet.ac.bd", "123456", stored), false);
});

test("equal OTPs receive different salts", () => {
  const first = hashOtp("joy@cuet.ac.bd", "123456");
  const second = hashOtp("joy@cuet.ac.bd", "123456");
  assert.notEqual(first, second);
});
