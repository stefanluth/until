'use server';

import { cookies } from 'next/headers';

import { COOKIE_OPTIONS } from '@/app/utils/cookies';

export async function addCountdown(countdownId: string) {
  const cookieStore = cookies();

  const countdowns = cookieStore.get('countdowns')?.value.split(',') || [];
  if (countdowns.includes(countdownId)) {
    return;
  }

  countdowns.push(countdownId.toString());
  cookieStore.set('countdowns', countdowns.join(','), COOKIE_OPTIONS);
}
