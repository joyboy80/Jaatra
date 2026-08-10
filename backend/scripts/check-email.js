import "dotenv/config";
import { verifyEmailTransport } from "../src/services/emailService.js";

try {
  await verifyEmailTransport({ requireConfigured: true });
  console.log("JAATRA SMTP connection verified successfully.");
} catch (error) {
  console.error(`JAATRA SMTP check failed: ${error.message}`);
  process.exitCode = 1;
}
