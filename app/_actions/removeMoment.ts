'use server';

import { cookies } from 'next/headers';

import { CONSENT_COOKIE, isConsentGranted } from '@/_utils/cookies';
import { getMomentList, removeMomentId, setMomentList } from '@/_utils/momentList';
import { decodeMomentToken } from '@/_utils/momentUrl';

type RemoveMomentResult = 'removed' | 'consent' | 'invalid';

export async function removeMoment(momentId: string): Promise<RemoveMomentResult> {
  const moment = decodeMomentToken(momentId);

  if (!moment) {
    return 'invalid';
  }

  const cookieStore = await cookies();

  if (!isConsentGranted(cookieStore.get(CONSENT_COOKIE)?.value)) {
    return 'consent';
  }

  setMomentList(cookieStore, removeMomentId(getMomentList(cookieStore), moment.id));

  return 'removed';
}
