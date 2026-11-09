export const CONSENT_COOKIE = 'consent';
export const MOMENT_LIST_COOKIE = 'moments';

export const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
  sameSite: 'lax',
} as const;

export function browserCookieOptions(
  protocol: string,
  options: { maxAge: number; path: string; sameSite: 'lax' | 'strict' | 'none' } = COOKIE_OPTIONS,
) {
  return {
    expires: options.maxAge / (60 * 60 * 24),
    path: options.path,
    sameSite: options.sameSite,
    secure: protocol === 'https:',
  };
}

export function isConsentGranted(value: string | undefined): boolean {
  return value === 'true';
}
