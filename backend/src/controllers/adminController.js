import { getProfileById, listPendingDrivers, serializeProfile, updateProfileById } from "../services/profileService.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

async function requirePendingDriver(profileId) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(profileId)) {
    throw new AppError(400, "Driver profile ID is invalid.", "INVALID_DRIVER_ID");
  }
  const profile = await getProfileById(profileId);
  if (!profile || profile.user_type !== "DRIVER") throw new AppError(404, "Driver profile not found.", "DRIVER_NOT_FOUND");
  if (!profile.is_verified) throw new AppError(409, "The Driver must verify their email before approval.", "DRIVER_NOT_VERIFIED");
  if (profile.approval_status !== "PENDING") throw new AppError(409, "This Driver approval has already been decided.", "DRIVER_ALREADY_REVIEWED");
  return profile;
}

export const pendingDrivers = asyncHandler(async (_req, res) => {
  const drivers = await listPendingDrivers();
  return sendSuccess(res, { data: { drivers } });
});

export const approveDriver = asyncHandler(async (req, res) => {
  await requirePendingDriver(req.params.id);
  const driver = await updateProfileById(req.params.id, {
    approval_status: "APPROVED",
    registration_status: "APPROVED",
    is_active: true,
  });
  return sendSuccess(res, { data: { driver: serializeProfile(driver) }, message: "Driver approved." });
});

export const rejectDriver = asyncHandler(async (req, res) => {
  await requirePendingDriver(req.params.id);
  const driver = await updateProfileById(req.params.id, {
    approval_status: "REJECTED",
    registration_status: "REJECTED",
    is_active: false,
  });
  return sendSuccess(res, { data: { driver: serializeProfile(driver) }, message: "Driver rejected." });
});
