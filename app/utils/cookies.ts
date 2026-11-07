export const CONSENT_COOKIE = 'consent';
export const COUNTDOWN_LIST_COOKIE = 'countdowns';

const useSecureCookies =
  process.env.COOKIE_SECURE === 'true' ||
  (process.env.COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production');

export const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
  sameSite: 'lax',
  secure: useSecureCookies,
} as const;

export function isConsentGranted(value: string | undefined): boolean {
  return value === 'true';
}
