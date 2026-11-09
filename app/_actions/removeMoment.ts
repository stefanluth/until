'use server';

import { cookies } from 'next/headers';

import { CONSENT_COOKIE, isConsentGranted } from '@/_utils/cookies';
import { getMomentList, removeMomentId, setMomentList } from '@/_utils/momentList';
import { isValidMomentId } from '@/_utils/validation';

type RemoveMomentResult = 'removed' | 'consent' | 'invalid';

export async function removeMoment(momentId: string): Promise<RemoveMomentResult> {
  if (!isValidMomentId(momentId)) {
    return 'invalid';
  }

  const cookieStore = await cookies();

  if (!isConsentGranted(cookieStore.get(CONSENT_COOKIE)?.value)) {
    return 'consent';
  }

  setMomentList(cookieStore, removeMomentId(getMomentList(cookieStore), momentId));

  return 'removed';
}
