import { createClient } from "@supabase/supabase-js";
import { env, validateEnvironment } from "./env.js";

const options = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
};

let adminClient;

export function getSupabaseAuth() {
  validateEnvironment({ requireSmtp: false });
  // Auth calls can mutate client-local session state, so do not share this
  // client across concurrent Express requests.
  return createClient(env.supabaseUrl, env.supabasePublishableKey, options);
}

export function getSupabaseAdmin() {
  validateEnvironment({ requireSmtp: false });
  adminClient ||= createClient(env.supabaseUrl, env.supabaseSecretKey, options);
  return adminClient;
}

export async function verifySupabaseConnection() {
  const admin = getSupabaseAdmin();
  const [{ error: profileError }, { error: verificationError }, { error: transportError }] = await Promise.all([
    admin.from("profiles").select([
      "id",
      "auth_user_id",
      "user_type",
      "full_name",
      "department_code",
      "department_name",
      "institutional_id",
      "student_id",
      "phone",
      "email",
      "gender",
      "profile_image",
      "is_verified",
      "is_active",
      "approval_status",
      "registration_status",
    ].join(",")).limit(1),
    admin.from("email_verifications").select("id").limit(1),
    admin.from("buses").select("id").limit(1),
  ]);
  if (profileError || verificationError) {
    const message = profileError?.message || verificationError?.message;
    throw new Error(`Supabase authentication schema is outdated. Run migration 002_complete_auth.sql: ${message}`);
  }
  if (transportError) throw new Error(`Supabase transport check failed. Run migration 003_transport.sql: ${transportError.message}`);
  return true;
}
