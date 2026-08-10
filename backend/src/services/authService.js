import { env } from "../config/env.js";
import { getSupabaseAdmin, getSupabaseAuth } from "../config/supabase.js";
import AppError from "../utils/AppError.js";
import { issueRegistrationOtp } from "./otpService.js";
import { createProfile, getProfileByAuthUserId, getProfileByEmail, serializeProfile, updateProfile } from "./profileService.js";

function serializeSession(session) {
  if (!session) return null;
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
    expiresIn: session.expires_in,
    tokenType: session.token_type,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  };
}

function authenticationError(error, fallback = "Authentication failed.") {
  const invalid = ["invalid_credentials", "email_not_confirmed"].includes(error?.code);
  return new AppError(
    invalid ? 401 : 400,
    invalid ? "Invalid email or password." : fallback,
    invalid ? "INVALID_CREDENTIALS" : "AUTHENTICATION_ERROR",
  );
}

function isDuplicateAuthEmail(error) {
  return error?.code === "email_exists" || /already|registered/i.test(error?.message || "");
}

async function findAuthUserByEmail(admin, email) {
  const perPage = 1000;
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw authenticationError(error, "Unable to inspect the existing authentication account.");

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email);
    if (user) return user;
    if (data.users.length < perPage) return null;
  }
}

async function createOrRecoverAuthUser(admin, input) {
  const attributes = {
    email: input.email,
    password: input.password,
    email_confirm: false,
    user_metadata: { full_name: input.fullName },
  };
  const { data, error } = await admin.auth.admin.createUser(attributes);
  if (!error && data.user) return { user: data.user, newlyCreated: true };
  if (!isDuplicateAuthEmail(error)) throw authenticationError(error, "Unable to register this account.");

  const existing = await findAuthUserByEmail(admin, input.email);
  if (!existing || existing.email_confirmed_at) {
    throw new AppError(409, "An account with this email already exists.", "EMAIL_ALREADY_REGISTERED");
  }

  // Recover an Auth user left behind without an application profile. Email
  // ownership is still required through the custom OTP before login is allowed.
  const { data: recovered, error: recoveryError } = await admin.auth.admin.updateUserById(existing.id, {
    password: input.password,
    user_metadata: attributes.user_metadata,
  });
  if (recoveryError || !recovered.user) {
    throw authenticationError(recoveryError, "Unable to recover the incomplete registration.");
  }
  return { user: recovered.user, newlyCreated: false };
}

async function rejectUnavailableProfile(profile, accessToken) {
  let error;
  if (!profile) error = new AppError(403, "No application profile is associated with this account.", "PROFILE_REQUIRED");
  else if (!profile.is_verified) error = new AppError(403, "Verify your email before signing in.", "EMAIL_NOT_VERIFIED");
  else if (!profile.is_active) error = new AppError(403, "This account has been deactivated.", "ACCOUNT_INACTIVE");
  else if (profile.user_type === "DRIVER" && profile.approval_status !== "APPROVED") {
    error = new AppError(403, profile.approval_status === "REJECTED" ? "This Driver account was rejected." : "This Driver account is awaiting Transport Admin approval.", profile.approval_status === "REJECTED" ? "DRIVER_REJECTED" : "DRIVER_PENDING_APPROVAL");
  }
  if (error) {
    if (accessToken) await getSupabaseAdmin().auth.admin.signOut(accessToken, "global").catch(() => undefined);
    throw error;
  }
}

export async function registerUser(input) {
  if (await getProfileByEmail(input.email)) throw new AppError(409, "An account with this email already exists.", "EMAIL_ALREADY_REGISTERED");

  const admin = getSupabaseAdmin();
  const authAccount = await createOrRecoverAuthUser(admin, input);

  let profile;
  try {
    profile = await createProfile({
      auth_user_id: authAccount.user.id,
      user_type: input.userType,
      full_name: input.fullName,
      department_code: input.departmentCode,
      department_name: input.departmentName,
      institutional_id: input.institutionalId,
      student_id: input.studentId,
      phone: input.phone,
      email: input.email,
      gender: input.gender,
      is_verified: false,
      is_active: true,
      approval_status: input.userType === "DRIVER" ? "PENDING" : "APPROVED",
      registration_status: "PENDING_VERIFICATION",
    });
  } catch (profileError) {
    if (authAccount.newlyCreated) await admin.auth.admin.deleteUser(authAccount.user.id).catch(() => undefined);
    throw profileError;
  }

  const otp = await issueRegistrationOtp(input.email);
  return { user: serializeProfile(profile), verification: otp, session: null };
}

export async function loginUser({ email, password }) {
  const { data, error } = await getSupabaseAuth().auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) throw authenticationError(error);

  const profile = await getProfileByAuthUserId(data.user.id);
  await rejectUnavailableProfile(profile, data.session.access_token);
  return { user: serializeProfile(profile), session: serializeSession(data.session) };
}

export async function logoutUser(accessToken) {
  const { error } = await getSupabaseAdmin().auth.admin.signOut(accessToken, "global");
  if (error) throw new AppError(400, "Unable to end the current session.", "LOGOUT_FAILED");
}

export async function refreshUserSession(refreshToken) {
  const { data, error } = await getSupabaseAuth().auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session || !data.user) throw new AppError(401, "The session could not be refreshed.", "REFRESH_FAILED");

  const profile = await getProfileByAuthUserId(data.user.id);
  await rejectUnavailableProfile(profile, data.session.access_token);
  return { user: serializeProfile(profile), session: serializeSession(data.session) };
}

export async function requestPasswordReset(email) {
  const { error } = await getSupabaseAuth().auth.resetPasswordForEmail(email, {
    redirectTo: `${env.frontendUrl.replace(/\/$/, "")}/reset-password`,
  });
  if (error) throw new AppError(400, "Unable to send the password-reset email.", "PASSWORD_RESET_REQUEST_FAILED");
}

export async function resetPassword(accessToken, password) {
  const { data, error: userError } = await getSupabaseAuth().auth.getUser(accessToken);
  if (userError || !data.user) throw new AppError(401, "The password-reset link is invalid or expired.", "INVALID_RESET_TOKEN");

  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(data.user.id, { password });
  if (error) throw new AppError(400, "Unable to reset the password.", "PASSWORD_RESET_FAILED");
  await getSupabaseAdmin().auth.admin.signOut(accessToken, "global").catch(() => undefined);
}

export async function updateCurrentProfile(authUserId, updates) {
  return serializeProfile(await updateProfile(authUserId, updates));
}
