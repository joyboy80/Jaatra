import { env } from "../config/env.js";

export const ACCESS_COOKIE = "safar_access";
export const REFRESH_COOKIE = "safar_refresh";
export const REMEMBER_COOKIE = "safar_remember";

function cookieValue(value) {
  return encodeURIComponent(value);
}

function serializeCookie(name, value, { path, maxAge, expires } = {}) {
  const parts = [
    `${name}=${cookieValue(value)}`,
    `Path=${path || "/api"}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (env.nodeEnv === "production") parts.push("Secure");
  if (Number.isFinite(maxAge)) parts.push(`Max-Age=${Math.max(0, Math.floor(maxAge))}`);
  if (expires) parts.push(`Expires=${expires.toUTCString()}`);
  return parts.join("; ");
}

function appendCookies(res, cookies) {
  res.setHeader("Set-Cookie", cookies);
}

export function readCookie(header = "", name) {
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export function readSessionCookies(req) {
  const header = req.headers.cookie || "";
  return {
    accessToken: readCookie(header, ACCESS_COOKIE),
    refreshToken: readCookie(header, REFRESH_COOKIE),
    remember: readCookie(header, REMEMBER_COOKIE) === "1",
  };
}

export function setSessionCookies(res, session, { remember = false } = {}) {
  const accessMaxAge = Number(session.expiresIn || session.expires_in || 3600);
  appendCookies(res, [
    serializeCookie(ACCESS_COOKIE, session.accessToken || session.access_token, {
      path: "/api",
      ...(remember ? { maxAge: accessMaxAge } : {}),
    }),
    serializeCookie(REFRESH_COOKIE, session.refreshToken || session.refresh_token, {
      path: "/api/auth",
      ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    }),
    serializeCookie(REMEMBER_COOKIE, remember ? "1" : "", {
      path: "/api/auth",
      ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : { maxAge: 0, expires: new Date(0) }),
    }),
  ]);
}

export function clearSessionCookies(res) {
  const expired = new Date(0);
  appendCookies(res, [
    serializeCookie(ACCESS_COOKIE, "", { path: "/api", maxAge: 0, expires: expired }),
    serializeCookie(REFRESH_COOKIE, "", { path: "/api/auth", maxAge: 0, expires: expired }),
    serializeCookie(REMEMBER_COOKIE, "", { path: "/api/auth", maxAge: 0, expires: expired }),
  ]);
}

export function publicSession(session) {
  if (!session) return null;
  return {
    expiresAt: session.expiresAt || session.expires_at,
    expiresIn: session.expiresIn || session.expires_in,
    tokenType: session.tokenType || session.token_type,
  };
}
