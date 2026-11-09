'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { momentPath } from '@/_utils/momentUrl';
import { splitRemaining } from '@/_utils/timer';
import type { Moment, MomentVariant } from '@/types';

import { MomentCardActions } from './MomentCardActions';
import { MomentCardHeader } from './MomentCardHeader';
import { MomentTimer } from './MomentTimer';

export default function MomentCard({ variant = 'card', ...moment }: Moment & { variant?: MomentVariant }) {
  const [now, setNow] = useState(() => Date.now());
  const momentTime = useMemo(() => moment.date.getTime(), [moment.date]);

  useEffect(() => {
    if (momentTime <= Date.now()) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [momentTime]);

  const remaining = splitRemaining(momentTime - now);
  const isDetail = variant === 'detail';

  if (isDetail) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center w-full max-w-6xl px-4 mx-auto text-center">
        <MomentCardHeader name={moment.name} date={moment.date} variant="detail" />
        <MomentTimer parts={remaining} variant="detail" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col w-full min-h-56 sm:min-h-80 max-w-2xl rounded-2xl border border-black/5 bg-white/30 shadow-sm transition-shadow hover:shadow-md has-[[aria-expanded=true]]:z-20 dark:border-white/15 dark:bg-white/[0.06]">
      <Link
        className="absolute inset-0 z-0 rounded-2xl"
        href={momentPath(moment.id)}
        aria-label={`Open ${moment.name}`}
      />
      <div className="pointer-events-none absolute right-2 top-1.5 z-10 flex justify-end sm:static sm:px-2 sm:pt-2">
        <div className="pointer-events-auto">
          <MomentCardActions id={moment.id} name={moment.name} date={moment.date} compactOnMobile />
        </div>
      </div>
      <div className="pointer-events-none flex flex-1 flex-col">
        <MomentCardHeader name={moment.name} date={moment.date} variant="card" />
        <MomentTimer parts={remaining} />
      </div>
    </div>
  );
}
