'use client';

import { useSyncExternalStore } from 'react';

import { formatDateParts } from '@/_utils/momentDisplay';
import type { MomentVariant } from '@/types';

// Nothing to subscribe to; the snapshot flips once after hydration.
const subscribeToMount = () => () => {};

/** Reports whether the component has hydrated on the client. */
function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );
}

/** Renders the moment's date and time for the viewer. */
function DateLabel({ date, className }: { date: Date; className: string }) {
  const mounted = useMounted();

  // Format on the client so the date uses the viewer's timezone and locale.
  const parts = mounted ? formatDateParts(date) : null;

  return (
    <p
      className={`flex flex-col items-center gap-0.5 leading-snug opacity-80 sm:flex-row sm:justify-center sm:gap-3 ${className}`}
    >
      {parts ? (
        <>
          <span>{parts.date}</span>
          {parts.time && (
            <span className="whitespace-nowrap sm:border-l sm:border-current/25 sm:pl-3">{parts.time}</span>
          )}
        </>
      ) : (
        // Reserve the line height until the client formats the date.
        <span aria-hidden>&nbsp;</span>
      )}
    </p>
  );
}

export function MomentCardHeader({
  name,
  date,
  variant = 'card',
}: {
  name: string;
  date: Date;
  variant?: MomentVariant;
}) {
  if (variant === 'detail') {
    return (
      <div className="flex w-full flex-col items-center gap-2 text-center sm:gap-4">
        <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight break-words sm:text-5xl md:text-7xl lg:text-8xl">
          {name}
        </h1>
        <DateLabel date={date} className="text-base sm:text-xl md:text-2xl" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col border-b border-black/10 dark:border-white/15">
      <div className="flex min-w-0 flex-col gap-1 px-4 pb-4 pt-3.5 text-center sm:gap-2 sm:px-6 sm:pb-5 sm:pt-3">
        <h2 className="text-balance px-10 text-2xl font-semibold leading-tight tracking-tight break-words sm:px-0 sm:text-4xl md:text-[2.5rem]">
          {name}
        </h2>
        <DateLabel date={date} className="text-sm sm:text-lg" />
      </div>
    </div>
  );
}
