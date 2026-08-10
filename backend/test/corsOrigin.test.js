import assert from "node:assert/strict";
import test from "node:test";
import { isCorsOriginAllowed } from "../src/utils/corsOrigin.js";

const allowedOrigins = ["https://jaatra.example.com"];

test("configured frontend origins are allowed", () => {
  assert.equal(isCorsOriginAllowed("https://jaatra.example.com", {
    allowedOrigins,
    nodeEnv: "production",
  }), true);
});

test("development permits localhost and private-network frontend URLs", () => {
  for (const origin of [
    "http://localhost:5173",
    "http://127.0.0.1:4173",
    "http://192.168.0.25:5173",
    "http://10.10.4.20:3000",
    "http://172.20.0.5:5174",
  ]) {
    assert.equal(isCorsOriginAllowed(origin, {
      allowedOrigins,
      nodeEnv: "development",
    }), true, origin);
  }
});

test("production rejects unconfigured local and public origins", () => {
  for (const origin of ["http://localhost:5173", "https://evil.example"]) {
    assert.equal(isCorsOriginAllowed(origin, {
      allowedOrigins,
      nodeEnv: "production",
    }), false, origin);
  }
});

test("development still rejects arbitrary public origins", () => {
  assert.equal(isCorsOriginAllowed("https://evil.example", {
    allowedOrigins,
    nodeEnv: "development",
  }), false);
});
