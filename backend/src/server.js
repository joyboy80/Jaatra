import "dotenv/config";
import app from "./app.js";
import { env, validateEnvironment } from "./config/env.js";
import { verifySupabaseConnection } from "./config/supabase.js";

async function startServer() {
  try {
    validateEnvironment();
    await verifySupabaseConnection();
    app.listen(env.port, () => {
      console.log(`Safar backend listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error(`Safar backend failed to start: ${error.message}`);
    process.exitCode = 1;
  }
}

startServer();
