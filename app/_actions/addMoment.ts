'use server';

import { cookies } from 'next/headers';

import { CONSENT_COOKIE, isConsentGranted } from '@/_utils/cookies';
import { addMomentId, getMomentList, setMomentList } from '@/_utils/momentList';
import { isValidMomentId } from '@/_utils/validation';

type AddMomentResult = 'added' | 'exists' | 'consent' | 'invalid';

export async function addMoment(momentId: string): Promise<AddMomentResult> {
  if (!isValidMomentId(momentId)) {
    return 'invalid';
  }

  const cookieStore = await cookies();

  if (!isConsentGranted(cookieStore.get(CONSENT_COOKIE)?.value)) {
    return 'consent';
  }

  const moments = getMomentList(cookieStore);

  if (moments.includes(momentId)) {
    return 'exists';
  }

  setMomentList(cookieStore, addMomentId(moments, momentId));

  return 'added';
}
