import { verifySupabaseConnection } from "../config/supabase.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const health = asyncHandler(async (_req, res) => {
  await verifySupabaseConnection();
  return sendSuccess(res, {
    data: {
      service: "jaatra-backend",
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    },
  });
});
