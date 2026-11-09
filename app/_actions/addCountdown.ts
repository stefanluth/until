'use server';

import { cookies } from 'next/headers';

import { CONSENT_COOKIE, isConsentGranted } from '@/_utils/cookies';
import { addCountdownId, getCountdownList, setCountdownList } from '@/_utils/countdownList';
import { isValidCountdownId } from '@/_utils/validation';

type AddCountdownResult = 'added' | 'exists' | 'consent' | 'invalid';

export async function addCountdown(countdownId: string): Promise<AddCountdownResult> {
  if (!isValidCountdownId(countdownId)) {
    return 'invalid';
  }

  const cookieStore = await cookies();

  if (!isConsentGranted(cookieStore.get(CONSENT_COOKIE)?.value)) {
    return 'consent';
  }

  const countdowns = getCountdownList(cookieStore);

  if (countdowns.includes(countdownId)) {
    return 'exists';
  }

  setCountdownList(cookieStore, addCountdownId(countdowns, countdownId));

  return 'added';
}
