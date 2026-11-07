'use server';

import { cookies } from 'next/headers';

import { CONSENT_COOKIE, COOKIE_OPTIONS } from '@/_utils/cookies';

export async function grantConsent() {
  (await cookies()).set(CONSENT_COOKIE, 'true', COOKIE_OPTIONS);
}
