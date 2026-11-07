'use server';

import { cookies } from 'next/headers';

import { CONSENT_COOKIE, isConsentGranted } from '@/_utils/cookies';
import { getCountdownList, removeCountdownId, setCountdownList } from '@/_utils/countdownList';
import { isValidCountdownId } from '@/_utils/validation';

export type RemoveCountdownResult = 'removed' | 'consent' | 'invalid';

export async function removeCountdown(countdownId: string): Promise<RemoveCountdownResult> {
  if (!isValidCountdownId(countdownId)) {
    return 'invalid';
  }

  const cookieStore = await cookies();

  if (!isConsentGranted(cookieStore.get(CONSENT_COOKIE)?.value)) {
    return 'consent';
  }

  setCountdownList(cookieStore, removeCountdownId(getCountdownList(cookieStore), countdownId));

  return 'removed';
}
