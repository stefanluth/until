'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createCountdown } from '@/db';
import { CONSENT_COOKIE, isConsentGranted } from '@/utils/cookies';
import { createCountdownId } from '@/utils/countdownId';
import { addCountdownId, getCountdownList, setCountdownList } from '@/utils/countdownList';
import { parseWhen } from '@/utils/parseWhen';
import { consumeRateLimit, getRateLimitKey } from '@/utils/rateLimit';
import { parseClientDate, validateCountdownName, validateCountdownWhen } from '@/utils/validation';

export type CountdownFormState = {
  error: string;
  location: 'consent' | 'form' | 'name' | 'when' | '';
};

export async function submitCountdownAction(
  _previousState: CountdownFormState,
  formData: FormData,
): Promise<CountdownFormState> {
  const cookieStore = await cookies();

  if (!isConsentGranted(cookieStore.get(CONSENT_COOKIE)?.value)) {
    return { error: 'Please accept the cookie notice before creating a countdown.', location: 'consent' };
  }

  if (!consumeRateLimit(getRateLimitKey(await headers()))) {
    return { error: 'Too many countdowns created. Please try again later.', location: 'form' };
  }

  const nameResult = validateCountdownName(formData.get('name'));
  if (!nameResult.ok) {
    return nameResult;
  }

  const whenResult = validateCountdownWhen(formData.get('when'));
  if (!whenResult.ok) {
    return whenResult;
  }

  const clientDate = parseClientDate(formData.get('date'));
  const parsedWhen = parseWhen(whenResult.value);

  if (!parsedWhen) {
    return {
      error: 'Enter a duration like 1d 2h 3m or a date like 25-12-2026 18:00',
      location: 'when',
    };
  }

  const date = clientDate ?? parsedWhen;
  const countdownId = createCountdownId(nameResult.value, date);
  const countdownIds = getCountdownList(cookieStore);
  const created = await createCountdown({
    id: countdownId,
    name: nameResult.value,
    date,
  });

  if (!created || countdownIds.includes(countdownId)) {
    return { error: 'Countdown already exists', location: 'name' };
  }

  setCountdownList(cookieStore, addCountdownId(countdownIds, countdownId));

  redirect(`/countdowns`);
}
