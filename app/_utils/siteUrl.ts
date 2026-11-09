const FALLBACK_SITE_URL = 'http://localhost:3000';

export function resolveSiteUrl(env: Record<string, string | undefined> = process.env): string {
  const configured =
    env.NEXT_PUBLIC_SITE_URL?.trim() || env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || env.VERCEL_URL?.trim();

  if (!configured) {
    return FALLBACK_SITE_URL;
  }

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(configured) ? configured : `https://${configured}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}
