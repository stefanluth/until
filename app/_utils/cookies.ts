export const CONSENT_COOKIE = 'consent';
export const MOMENT_LIST_COOKIE = 'moments';

export const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
  sameSite: 'lax',
} as const;

export function isSecureCookie(protocol: string): boolean {
  return protocol === 'https:';
}

export function isConsentGranted(value: string | undefined): boolean {
  return value === 'true';
}
