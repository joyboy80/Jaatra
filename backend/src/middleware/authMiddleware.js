import { getSupabaseAuth } from "../config/supabase.js";
import { getProfileByAuthUserId, serializeProfile } from "../services/profileService.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { readSessionCookies } from "../utils/authCookies.js";
import { assertProfilePortalAccess } from "../utils/driverAccess.js";

function readBearerToken(header = "") {
  const [scheme, token] = header.trim().split(/\s+/);
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

const authMiddleware = asyncHandler(async (req, _res, next) => {
  const accessToken = readSessionCookies(req).accessToken || readBearerToken(req.headers.authorization);
  if (!accessToken) throw new AppError(401, "A valid session is required.", "UNAUTHORIZED");

  const { data, error } = await getSupabaseAuth().auth.getUser(accessToken);
  if (error || !data.user) throw new AppError(401, "The access token is invalid or expired.", "UNAUTHORIZED");

  const profile = await getProfileByAuthUserId(data.user.id);
  if (!profile) throw new AppError(401, "The authenticated account has no Safar profile.", "PROFILE_REQUIRED");
  assertProfilePortalAccess(profile);

  const publicProfile = serializeProfile(profile);
  req.accessToken = accessToken;
  req.user = {
    ...publicProfile,
    authUserId: data.user.id,
    profileId: profile.id,
    userType: profile.user_type,
    isVerified: profile.is_verified,
    isActive: profile.is_active,
    preferences: data.user.user_metadata?.preferences || { email: true, push: true },
  };
  next();
});

export { readBearerToken };
export default authMiddleware;
