export const CONSENT_COOKIE = 'consent';
export const MOMENT_LIST_COOKIE = 'moments';

type CookieEnvironment = {
  COOKIE_SECURE?: string;
  NODE_ENV?: string;
};

export function isSecureCookie(environment: CookieEnvironment): boolean {
  return (
    environment.COOKIE_SECURE === 'true' ||
    (environment.COOKIE_SECURE !== 'false' && environment.NODE_ENV === 'production')
  );
}

export const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
  sameSite: 'lax',
  secure: isSecureCookie(process.env),
} as const;

export function isConsentGranted(value: string | undefined): boolean {
  return value === 'true';
}
