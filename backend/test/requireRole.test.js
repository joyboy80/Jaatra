import assert from "node:assert/strict";
import test from "node:test";
import requireRole from "../src/middleware/requireRole.js";

function run(middleware, user) {
  return new Promise((resolve) => middleware({ user }, {}, resolve));
}

test("role middleware accepts an allowed role", async () => {
  const error = await run(requireRole("STUDENT", "TEACHER"), { userType: "STUDENT" });
  assert.equal(error, undefined);
});

test("role middleware rejects another authenticated role", async () => {
  const error = await run(requireRole("TRANSPORT_ADMIN"), { userType: "STUDENT" });
  assert.equal(error.statusCode, 403);
  assert.equal(error.code, "FORBIDDEN");
});

test("role middleware requires authentication", async () => {
  const error = await run(requireRole("TRANSPORT_ADMIN"), null);
  assert.equal(error.statusCode, 401);
});
