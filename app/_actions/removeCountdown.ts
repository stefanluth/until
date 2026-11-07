'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { CONSENT_COOKIE, isConsentGranted } from '@/utils/cookies';
import { getCountdownList, removeCountdownId, setCountdownList } from '@/utils/countdownList';
import { isValidCountdownId } from '@/utils/validation';

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
