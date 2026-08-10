import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";

const PURPOSE = "REGISTRATION";

function digestOtp(email, otp, salt) {
  return createHmac("sha256", env.otpHashSecret).update(`${PURPOSE}:${email}:${salt}:${otp}`).digest("hex");
}

export function hashOtp(email, otp) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${digestOtp(email, otp, salt)}`;
}

export function verifyOtpHash(email, otp, storedHash) {
  const [salt, expectedHex] = String(storedHash).split(":");
  if (!salt || !/^[a-f0-9]{64}$/i.test(expectedHex || "")) return false;
  const actual = Buffer.from(digestOtp(email, otp, salt), "hex");
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
