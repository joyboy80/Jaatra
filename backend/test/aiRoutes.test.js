import assert from "node:assert/strict";
import test from "node:test";
import aiRoutes from "../src/routes/aiRoutes.js";

test("SAFAR AI exposes authenticated context and chat endpoints", () => {
  const routes = aiRoutes.stack.filter((layer) => layer.route).map((layer) => `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
  assert.deepEqual(routes, ["GET /context", "POST /chat"]);
});
