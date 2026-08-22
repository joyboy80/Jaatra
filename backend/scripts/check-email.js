import "dotenv/config";
import { verifyEmailTransport } from "../src/services/emailService.js";

try {
  await verifyEmailTransport({ requireConfigured: true });
  console.log("SAFAR SMTP connection verified successfully.");
} catch (error) {
  console.error(`SAFAR SMTP check failed: ${error.message}`);
  process.exitCode = 1;
}
