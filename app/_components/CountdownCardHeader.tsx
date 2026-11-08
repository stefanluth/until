import { formatCountdownDate } from '@/_utils/countdownDisplay';
import type { CountdownVariant } from '@/types';

export function CountdownCardHeader({
  name,
  date,
  variant = 'card',
}: {
  name: string;
  date: Date;
  variant?: CountdownVariant;
}) {
  const dateLabel = formatCountdownDate(date);

  if (variant === 'detail') {
    return (
      <div className="flex w-full flex-col items-center gap-2 text-center sm:gap-4">
        <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight break-words sm:text-5xl md:text-7xl lg:text-8xl">
          {name}
        </h1>
        <p className="text-base opacity-80 sm:text-xl md:text-2xl" suppressHydrationWarning>
          {dateLabel}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col border-b border-black/10 dark:border-white/15">
      <div className="flex min-w-0 flex-col gap-1 px-4 pb-4 pt-2 text-center sm:gap-2 sm:px-6 sm:pb-5 sm:pt-3">
        <h2 className="text-balance text-2xl font-semibold leading-tight tracking-tight break-words sm:text-4xl md:text-[2.5rem]">
          {name}
        </h2>
        <p className="text-sm opacity-80 sm:text-lg" suppressHydrationWarning>
          {dateLabel}
        </p>
      </div>
    </div>
  );
}
