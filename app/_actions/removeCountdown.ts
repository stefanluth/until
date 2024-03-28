'use server';

import { cookies } from 'next/headers';

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
  sameSite: 'lax',
} as const;

export async function removeCountdown(formData: FormData) {
  const countdownId = formData.get('id');

  const cookieStore = cookies();
  const countdowns = cookieStore.get('countdowns')?.value.split(',') || [];
  const newCountdowns = countdowns.filter((countdown) => countdown !== countdownId);

  cookieStore.set('countdowns', newCountdowns.join(','), COOKIE_OPTIONS);
}
