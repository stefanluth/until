'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { CONSENT_COOKIE, isConsentGranted } from '@/_utils/cookies';
import { getCountdownList, removeCountdownId, setCountdownList } from '@/_utils/countdownList';
import { isValidCountdownId } from '@/_utils/validation';

export async function removeCountdown(countdownId: string) {
  if (!isValidCountdownId(countdownId)) {
    return;
  }

  const cookieStore = await cookies();

  if (!isConsentGranted(cookieStore.get(CONSENT_COOKIE)?.value)) {
    redirect('/');
  }

  setCountdownList(cookieStore, removeCountdownId(getCountdownList(cookieStore), countdownId));
}
