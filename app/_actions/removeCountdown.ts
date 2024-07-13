'use server';

import { cookies } from 'next/headers';

import { COOKIE_OPTIONS } from '@/app/utils/cookies';

export async function removeCountdown(countdownId: string) {
  const cookieStore = cookies();
  const countdowns = cookieStore.get('countdowns')?.value.split(',') || [];
  const newCountdowns = countdowns.filter((countdown) => countdown !== countdownId);

  if (newCountdowns.length === 0) {
    cookieStore.delete({ name: 'countdowns', ...COOKIE_OPTIONS });
  } else {
    cookieStore.set('countdowns', newCountdowns.join(','), COOKIE_OPTIONS);
  }
}
