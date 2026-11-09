'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { splitRemaining } from '@/_utils/duration';
import type { Countdown, CountdownVariant } from '@/types';

import { CountdownCardActions } from './CountdownCardActions';
import { CountdownCardBody } from './CountdownCardBody';
import { CountdownCardHeader } from './CountdownCardHeader';

export default function CountdownCard({ variant = 'card', ...countdown }: Countdown & { variant?: CountdownVariant }) {
  const [now, setNow] = useState(() => Date.now());
  const countdownTime = useMemo(() => countdown.date.getTime(), [countdown.date]);

  useEffect(() => {
    if (countdownTime <= Date.now()) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownTime]);

  const remaining = splitRemaining(countdownTime - now);
  const isDetail = variant === 'detail';

  if (isDetail) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center w-full max-w-6xl px-4 mx-auto text-center">
        <CountdownCardHeader name={countdown.name} date={countdown.date} variant="detail" />
        <CountdownCardBody
          d={remaining.days}
          h={remaining.hours}
          m={remaining.minutes}
          s={remaining.seconds}
          variant="detail"
        />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col w-full min-h-56 sm:min-h-80 max-w-2xl rounded-2xl border border-black/5 bg-white/30 shadow-sm transition-shadow hover:shadow-md has-[[aria-expanded=true]]:z-20 dark:border-white/15 dark:bg-white/[0.06]">
      <Link className="absolute inset-0 z-0 rounded-2xl" href={countdown.id} aria-label={`Open ${countdown.name}`} />
      <div className="pointer-events-none absolute right-2 top-1.5 z-10 flex justify-end sm:static sm:px-2 sm:pt-2">
        <div className="pointer-events-auto">
          <CountdownCardActions id={countdown.id} name={countdown.name} date={countdown.date} compactOnMobile />
        </div>
      </div>
      <div className="pointer-events-none flex flex-1 flex-col">
        <CountdownCardHeader name={countdown.name} date={countdown.date} variant="card" />
        <CountdownCardBody d={remaining.days} h={remaining.hours} m={remaining.minutes} s={remaining.seconds} />
      </div>
    </div>
  );
}
