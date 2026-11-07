'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { CONSENT_COOKIE, isConsentGranted } from '@/_utils/cookies';
import { addCountdownId, getCountdownList, setCountdownList } from '@/_utils/countdownList';
import { isValidCountdownId } from '@/_utils/validation';

export async function addCountdown(countdownId: string) {
  if (!isValidCountdownId(countdownId)) {
    return;
  }

  const cookieStore = await cookies();

  if (!isConsentGranted(cookieStore.get(CONSENT_COOKIE)?.value)) {
    redirect('/');
  }

  const countdowns = getCountdownList(cookieStore);

  if (countdowns.includes(countdownId)) {
    return;
  }

  setCountdownList(cookieStore, addCountdownId(countdowns, countdownId));
}
