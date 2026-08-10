function isPrivateIpv4(hostname) {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  return parts[0] === 10
    || parts[0] === 127
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 192 && parts[1] === 168);
}

export function isLocalDevelopmentOrigin(origin) {
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    const hostname = url.hostname.toLowerCase();
    return hostname === "localhost"
      || hostname === "0.0.0.0"
      || hostname === "::1"
      || hostname === "[::1]"
      || isPrivateIpv4(hostname);
  } catch {
    return false;
  }
}

export function isCorsOriginAllowed(origin, { allowedOrigins, nodeEnv }) {
  if (!origin || allowedOrigins.includes(origin)) return true;
  return nodeEnv !== "production" && isLocalDevelopmentOrigin(origin);
}
