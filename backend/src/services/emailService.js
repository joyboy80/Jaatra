import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";

let transporter;

export function isEmailDeliveryConfigured() {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPassword && env.smtpFrom);
}

function getTransporter() {
  transporter ||= nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: { user: env.smtpUser, pass: env.smtpPassword },
  });
  return transporter;
}

export async function verifyEmailTransport({ requireConfigured = false } = {}) {
  if (!isEmailDeliveryConfigured()) {
    if (requireConfigured) {
      throw new AppError(500, "SMTP is not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM to backend/.env.", "SMTP_NOT_CONFIGURED");
    }
    return { configured: false, verified: false };
  }

  try {
    await getTransporter().verify();
    return { configured: true, verified: true };
  } catch (error) {
    console.error("[SAFAR email] SMTP verification failed", {
      code: error?.code,
      command: error?.command,
      responseCode: error?.responseCode,
    });
    throw new AppError(502, "Unable to authenticate with the configured email server.", "SMTP_CONNECTION_FAILED");
  }
}

export async function sendRegistrationOtp(email, otp) {
  const text = [
    "SAFAR",
    "University Transportation System",
    "",
    "Your verification code is:",
    otp,
    "",
    `This code expires in ${env.otpExpiresMinutes} minutes.`,
    "",
    "If you did not request this verification code, please ignore this email.",
  ].join("\n");

  const html = `<!doctype html>
  <html><body style="margin:0;background:#f4f7f6;font-family:Arial,sans-serif;color:#18332c">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden">
        <tr><td style="padding:24px 32px;background:#075e54;color:#fff"><strong style="font-size:26px">SAFAR</strong><br><span>University Transportation System</span></td></tr>
        <tr><td style="padding:32px;text-align:center"><p>Your verification code is:</p><div style="font-size:36px;font-weight:700;letter-spacing:10px;margin:22px 0">${otp}</div><p>This code expires in ${env.otpExpiresMinutes} minutes.</p><p style="color:#687773;font-size:14px">If you did not request this verification code, please ignore this email.</p></td></tr>
      </table>
    </td></tr></table>
  </body></html>`;

  if (!isEmailDeliveryConfigured()) {
    if (env.nodeEnv === "production") {
      throw new AppError(500, "SMTP is not configured.", "SMTP_NOT_CONFIGURED");
    }
    console.info(`[SAFAR development OTP] ${email}: ${otp} (expires in ${env.otpExpiresMinutes} minutes)`);
    return { delivered: false, delivery: "DEVELOPMENT_CONSOLE" };
  }

  try {
    const info = await getTransporter().sendMail({
      from: env.smtpFrom,
      to: email,
      subject: "Your SAFAR verification code",
      text,
      html,
    });
    console.log(info);
    return { delivered: true, delivery: "EMAIL", messageId: info.messageId };
  } catch (error) {
    console.error("[SAFAR email] OTP delivery failed", {
      code: error?.code,
      command: error?.command,
      responseCode: error?.responseCode,
    });
    console.log('OTP Delivery failed');
    throw new AppError(502, "The verification email could not be delivered. Please try again.", "EMAIL_DELIVERY_FAILED");
  }
}
