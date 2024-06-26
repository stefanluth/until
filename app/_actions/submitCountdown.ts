'use server';

import { createHash } from 'crypto';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { prisma } from '@/app/prisma';
import { COOKIE_OPTIONS } from '@/app/utils/cookies';

async function submitCountdown(formData: FormData) {
  const name = formData.get('name') as string;
  const date = formData.get('date') as string | null;
  const duration = formData.get('duration') as string | null;

  let parsedDate: Date | null = null;

  if (!name) {
    return { error: 'Name is required', location: 'name' };
  }

  if (!date && !duration) {
    return { error: 'Date or duration is required', location: 'date' };
  }

  if (date && duration) {
    return { error: 'Date and duration are mutually exclusive', location: 'date' };
  }

  if (date) {
    if (isNaN(Date.parse(date))) {
      return { error: 'Invalid date', location: 'date' };
    }

    parsedDate = new Date(date);
  } else if (duration) {
    const durationRegex = /^(\d+d)?\s*(\d+h)?\s*(\d+m)?\s*(\d+s)?$/;
    if (!durationRegex.test(duration)) {
      return { error: 'Invalid duration', location: 'duration' };
    }

    const durationParts = duration.match(durationRegex);
    if (!durationParts) {
      return { error: 'Invalid duration', location: 'duration' };
    }

    const days = parseInt(durationParts[1]?.replace('d', '') || '0');
    const hours = parseInt(durationParts[2]?.replace('h', '') || '0');
    const minutes = parseInt(durationParts[3]?.replace('m', '') || '0');
    const seconds = parseInt(durationParts[3]?.replace('s', '') || '0');

    parsedDate = new Date();
    parsedDate.setDate(parsedDate.getDate() + days);
    parsedDate.setHours(parsedDate.getHours() + hours);
    parsedDate.setMinutes(parsedDate.getMinutes() + minutes);
    parsedDate.setSeconds(parsedDate.getSeconds() + seconds);
  }

  if (!parsedDate) {
    return { error: 'Invalid date', location: 'date' };
  }

  const hash = createHash('sha256')
    .update(name + parsedDate.toISOString())
    .digest('hex')
    .slice(0, 8);

  const countdownId = `${encodeURIComponent(name)}-${hash}`;

  const existingCountdown = await prisma.countdown.findFirst({ where: { id: countdownId } });
  if (existingCountdown) {
    return { error: 'Countdown already exists', location: 'name' };
  }

  await prisma.countdown.create({
    data: {
      id: countdownId,
      name: name,
      date: parsedDate.getTime(),
    },
  });

  const cookieStore = cookies();
  const countdowns = cookieStore.get('countdowns')?.value;

  if (!countdowns) {
    cookieStore.set('countdowns', countdownId, COOKIE_OPTIONS);
  } else {
    if (countdowns.includes(countdownId)) {
      return { error: 'Countdown already exists', location: 'name' };
    }
    cookieStore.set('countdowns', `${countdowns},${countdownId}`, COOKIE_OPTIONS);
  }

  redirect(`/countdowns`);
}

export async function submitCountdownAction(prevState: any, formData: FormData) {
  return await submitCountdown(formData);
}
