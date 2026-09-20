import { getSupabaseAuth } from "../config/supabase.js";
import { getProfileByAuthUserId, serializeProfile } from "../services/profileService.js";
import { refreshUserSession } from "../services/authService.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { clearSessionCookies, readSessionCookies, setSessionCookies } from "../utils/authCookies.js";
import { assertProfilePortalAccess } from "../utils/driverAccess.js";

function readBearerToken(header = "") {
  const [scheme, token] = header.trim().split(/\s+/);
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

const authMiddleware = asyncHandler(async (req, res, next) => {
  const cookies = readSessionCookies(req);
  let accessToken = cookies.accessToken || readBearerToken(req.headers.authorization);
  let authUserId = null;
  let userPreferences = null;

  if (accessToken) {
    const { data, error } = await getSupabaseAuth().auth.getUser(accessToken);
    if (!error && data?.user) {
      authUserId = data.user.id;
      userPreferences = data.user.user_metadata?.preferences;
    }
  }

  // If accessToken is missing or expired, but we have a valid refreshToken cookie:
  if (!authUserId && cookies.refreshToken) {
    try {
      const refreshed = await refreshUserSession(cookies.refreshToken);
      setSessionCookies(res, refreshed.session, { remember: cookies.remember !== false });
      accessToken = refreshed.session.accessToken;
      authUserId = refreshed.user.authUserId;
      userPreferences = refreshed.user.preferences;
    } catch {
      clearSessionCookies(res);
    }
  }

  if (!authUserId) {
    const hadCredentials = Boolean(cookies.accessToken || cookies.refreshToken || readBearerToken(req.headers.authorization));
    if (hadCredentials) {
      throw new AppError(401, "Your session expired. Please sign in again.", "SESSION_EXPIRED");
    }
    throw new AppError(401, "A valid session is required.", "UNAUTHORIZED");
  }

  const profile = await getProfileByAuthUserId(authUserId);
  if (!profile) throw new AppError(401, "The authenticated account has no Safar profile.", "PROFILE_REQUIRED");
  assertProfilePortalAccess(profile);

  const publicProfile = serializeProfile(profile);
  req.accessToken = accessToken;
  req.user = {
    ...publicProfile,
    authUserId,
    profileId: profile.id,
    userType: profile.user_type,
    isVerified: profile.is_verified,
    isActive: profile.is_active,
    preferences: userPreferences || { email: true, push: true },
  };
  next();
});

export { readBearerToken };
export default authMiddleware;
