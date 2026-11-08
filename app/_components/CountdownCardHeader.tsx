import { formatCountdownDateParts } from '@/_utils/countdownDisplay';
import type { CountdownVariant } from '@/types';

function CountdownDate({ date, className }: { date: Date; className: string }) {
  const { date: dateText, time } = formatCountdownDateParts(date);

  return (
    <p
      className={`flex flex-col items-center gap-0.5 leading-snug opacity-80 sm:flex-row sm:justify-center sm:gap-3 ${className}`}
    >
      <span suppressHydrationWarning>{dateText}</span>
      {time && (
        <span suppressHydrationWarning className="whitespace-nowrap sm:border-l sm:border-current/25 sm:pl-3">
          {time}
        </span>
      )}
    </p>
  );
}

export function CountdownCardHeader({
  name,
  date,
  variant = 'card',
}: {
  name: string;
  date: Date;
  variant?: CountdownVariant;
}) {
  if (variant === 'detail') {
    return (
      <div className="flex w-full flex-col items-center gap-2 text-center sm:gap-4">
        <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight break-words sm:text-5xl md:text-7xl lg:text-8xl">
          {name}
        </h1>
        <CountdownDate date={date} className="text-base sm:text-xl md:text-2xl" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col border-b border-black/10 dark:border-white/15">
      <div className="flex min-w-0 flex-col gap-1 px-4 pb-4 pt-3.5 text-center sm:gap-2 sm:px-6 sm:pb-5 sm:pt-3">
        <h2 className="text-balance px-10 text-2xl font-semibold leading-tight tracking-tight break-words sm:px-0 sm:text-4xl md:text-[2.5rem]">
          {name}
        </h2>
        <CountdownDate date={date} className="text-sm sm:text-lg" />
      </div>
    </div>
  );
}
