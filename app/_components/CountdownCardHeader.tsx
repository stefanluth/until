import type { ReactNode } from 'react';

import type { CountdownVariant } from '@/types';

export function CountdownCardHeader({
  name,
  date,
  actions,
  variant = 'card',
}: {
  name: string;
  date: Date;
  actions?: ReactNode;
  variant?: CountdownVariant;
}) {
  const timeString = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const isMidnight = date.getHours() === 0 && date.getMinutes() === 0;
  const dateLabel = isMidnight ? dateString : `${dateString} | ${timeString}`;

  if (variant === 'detail') {
    return (
      <div className="flex w-full flex-col items-center gap-2 sm:gap-4 text-center">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-none tracking-tight break-words">
          {name}
        </h1>
        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl" suppressHydrationWarning>
          {dateLabel}
        </h3>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col border-b">
      {actions && <div className="flex justify-end px-4 pt-3 sm:px-6 sm:pt-4">{actions}</div>}
      <div
        className={`flex min-w-0 flex-col gap-2 px-4 pb-4 text-center sm:px-6 sm:pb-5 ${actions ? '' : 'pt-4 sm:pt-5'}`}
      >
        <h1 className="text-4xl md:text-[2.5rem] leading-tight break-words">{name}</h1>
        <h3 className="text-lg" suppressHydrationWarning>
          {dateLabel}
        </h3>
      </div>
    </div>
  );
}
