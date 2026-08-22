import AppError from "./AppError.js";

// Approval remains a compatibility field only; it is never an access control input.
export function assertProfilePortalAccess(profile) {
  if (!profile?.is_verified) throw new AppError(403, "Email verification is required.", "EMAIL_NOT_VERIFIED");
  if (!profile.is_active) throw new AppError(403, "This account has been deactivated.", "ACCOUNT_INACTIVE");
  return profile;
}
