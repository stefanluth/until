'use server';

import { cookies } from 'next/headers';

import { COOKIE_OPTIONS } from '@/app/utils/cookies';

export async function removeCountdown(formData: FormData) {
  const countdownId = formData.get('id');

  const cookieStore = cookies();
  const countdowns = cookieStore.get('countdowns')?.value.split(',') || [];
  const newCountdowns = countdowns.filter((countdown) => countdown !== countdownId);

  cookieStore.set('countdowns', newCountdowns.join(','), COOKIE_OPTIONS);
}
