/**
 * Cookie tabanlı admin oturumu.
 * Süre: SESSION_MAX_AGE_HOURS (örn. "8") — varsayılan 8 saat. Eski davranış 7 gündü.
 */
export const SESSION_COOKIE = "ks_session";

export function getSessionCookieValue(): string {
  return process.env.SESSION_SECRET ?? "kurbanlik-session-secret-2026";
}

/** Saniye cinsinden; tarayıcı oturumu bu süre sonunda düşer. */
export function getSessionMaxAgeSeconds(): number {
  const raw = process.env.SESSION_MAX_AGE_HOURS;
  const hours =
    raw !== undefined && raw !== "" ? Number(String(raw).trim()) : NaN;
  const h =
    Number.isFinite(hours) && hours > 0 && hours <= 24 * 365
      ? hours
      : 8;
  return Math.floor(h * 3600);
}
