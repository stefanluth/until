'use server';

import { cookies } from 'next/headers';

import { CONSENT_COOKIE, isConsentGranted } from '@/_utils/cookies';
import { addMomentId, getMomentList, setMomentList } from '@/_utils/momentList';
import { decodeMomentToken } from '@/_utils/momentUrl';

type AddMomentResult = 'added' | 'exists' | 'consent' | 'invalid';

export async function addMoment(momentId: string): Promise<AddMomentResult> {
  const moment = decodeMomentToken(momentId);

  if (!moment) {
    return 'invalid';
  }

  const cookieStore = await cookies();

  if (!isConsentGranted(cookieStore.get(CONSENT_COOKIE)?.value)) {
    return 'consent';
  }

  const moments = getMomentList(cookieStore);

  if (moments.includes(moment.id)) {
    return 'exists';
  }

  setMomentList(cookieStore, addMomentId(moments, moment.id));

  return 'added';
}
