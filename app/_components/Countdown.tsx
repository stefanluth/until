'use client';

import { useEffect, useMemo, useState } from 'react';

import { Countdown } from '@prisma/client';

import { CountdownCardBody } from './CountdownCardBody';
import { CountdownCardFooter } from './CountdownCardFooter';
import { CountdownCardHeader } from './CountdownCardHeader';

export default function CountdownCard(countdown: Countdown) {
  const [now, setNow] = useState(new Date().getTime());
  const countdownTime = useMemo(() => Number(countdown.date), [countdown.date]);
  const diff = countdownTime - now;

  useEffect(() => {
    if (diff <= 0) return;

    const interval = setInterval(() => {
      setNow(new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor(diff / 1000);

  return (
    <div className="flex flex-col justify-between w-full h-72 max-w-2xl rounded-2xl backdrop-brightness-105">
      <CountdownCardHeader name={countdown.name} date={new Date(countdownTime)} />
      <CountdownCardBody d={days} h={hours % 24} m={minutes % 60} s={seconds % 60} />
      <CountdownCardFooter id={countdown.id} />
    </div>
  );
}
