import "dotenv/config";
import { getSupabaseAdmin, verifySupabaseConnection } from "../src/config/supabase.js";
import { createProfile } from "../src/services/profileService.js";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

async function createFirstAdmin() {
  const email = required("BOOTSTRAP_ADMIN_EMAIL").toLowerCase();
  const password = required("BOOTSTRAP_ADMIN_PASSWORD");
  const fullName = required("BOOTSTRAP_ADMIN_NAME");
  const employeeId = required("BOOTSTRAP_ADMIN_EMPLOYEE_ID");
  if (password.length < 12) throw new Error("BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters.");
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@cuet\.ac\.bd$/i.test(email)) {
    throw new Error("BOOTSTRAP_ADMIN_EMAIL must be a CUET email address.");
  }

  await verifySupabaseConnection();
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) throw new Error(error?.message || "Unable to create the Supabase Auth user.");

  try {
    await createProfile({
      auth_user_id: data.user.id,
      full_name: fullName,
      email,
      user_type: "TRANSPORT_ADMIN",
      gender: "PREFER_NOT_TO_SAY",
      institutional_id: employeeId,
      is_verified: true,
      is_active: true,
      approval_status: "APPROVED",
      registration_status: "APPROVED",
    });
  } catch (error) {
    await admin.auth.admin.deleteUser(data.user.id).catch(() => undefined);
    throw error;
  }

  console.log(`Transport Admin account created for ${email}.`);
}

createFirstAdmin().catch((error) => {
  console.error(`Admin creation failed: ${error.message}`);
  process.exitCode = 1;
});
