'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { CONSENT_COOKIE, isConsentGranted } from '@/_utils/cookies';
import { createMomentId } from '@/_utils/momentId';
import { addMomentId, getMomentList, setMomentList } from '@/_utils/momentList';
import { parseWhen } from '@/_utils/parseWhen';
import { consumeRateLimit, getRateLimitKey } from '@/_utils/rateLimit';
import { parseClientDate, validateMomentName, validateMomentWhen } from '@/_utils/validation';
import { createMoment } from '@/db';

export type MomentFormState = {
  error: string;
  location: 'consent' | 'form' | 'name' | 'when' | '';
};

export async function submitMomentAction(
  _previousState: MomentFormState,
  formData: FormData,
): Promise<MomentFormState> {
  const cookieStore = await cookies();

  if (!isConsentGranted(cookieStore.get(CONSENT_COOKIE)?.value)) {
    return { error: 'Accept cookies to create a moment.', location: 'consent' };
  }

  if (!consumeRateLimit(getRateLimitKey(await headers()))) {
    return { error: 'Too many moments. Try again later.', location: 'form' };
  }

  const nameResult = validateMomentName(formData.get('name'));
  if (!nameResult.ok) {
    return nameResult;
  }

  const whenResult = validateMomentWhen(formData.get('when'));
  if (!whenResult.ok) {
    return whenResult;
  }

  const clientDate = parseClientDate(formData.get('date'));
  const parsedWhen = parseWhen(whenResult.value);

  if (!parsedWhen) {
    return {
      error: 'e.g. 1d 2h 3m or 25-12-2026 18:00',
      location: 'when',
    };
  }

  const date = clientDate ?? parsedWhen;
  const momentId = createMomentId(nameResult.value, date);
  const momentIds = getMomentList(cookieStore);
  const created = await createMoment({
    id: momentId,
    name: nameResult.value,
    date,
  });

  if (!created || momentIds.includes(momentId)) {
    return { error: 'Moment already exists', location: 'name' };
  }

  setMomentList(cookieStore, addMomentId(momentIds, momentId));

  redirect(`/moments`);
}
