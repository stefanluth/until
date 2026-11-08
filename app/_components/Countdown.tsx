'use client';

import { useEffect, useMemo, useState } from 'react';

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

  return (
    <div
      className={
        isDetail
          ? 'flex flex-1 flex-col items-center justify-center w-full max-w-6xl px-4 mx-auto text-center'
          : 'flex flex-col w-full min-h-80 max-w-2xl rounded-2xl backdrop-brightness-105'
      }
    >
      <CountdownCardHeader
        name={countdown.name}
        date={countdown.date}
        variant={variant}
        actions={
          isDetail ? undefined : <CountdownCardActions id={countdown.id} name={countdown.name} date={countdown.date} />
        }
      />
      <CountdownCardBody
        d={remaining.days}
        h={remaining.hours}
        m={remaining.minutes}
        s={remaining.seconds}
        variant={variant}
      />
    </div>
  );
}
