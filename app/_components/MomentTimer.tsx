import { type RemainingParts, getVisibleUnits } from '@/_utils/timer';
import { unitLabel } from '@/_utils/timerDisplay';
import type { MomentVariant } from '@/types';

const CARD_ROW_CLASS =
  'flex flex-1 w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 p-3 sm:gap-x-8 sm:gap-y-4 sm:p-5';
const CARD_VALUE_CLASS =
  'text-3xl font-semibold leading-none tabular-nums tracking-tight min-[380px]:text-4xl sm:text-5xl md:text-[3.25rem]';
const CARD_LABEL_CLASS = 'text-xs uppercase tracking-widest opacity-75 sm:text-sm';
const DETAIL_ROW_CLASS =
  'flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-5 px-2 mt-8 sm:gap-x-12 sm:gap-y-8 sm:mt-14 lg:gap-x-16';
const DETAIL_VALUE_CLASS =
  'text-5xl font-semibold leading-none tabular-nums tracking-tight min-[380px]:text-6xl sm:text-7xl md:text-8xl lg:text-9xl';
const DETAIL_LABEL_CLASS = 'text-xs uppercase tracking-[0.2em] opacity-75 sm:text-base md:text-lg lg:text-xl';

const CLASSES = {
  card: {
    row: CARD_ROW_CLASS,
    value: CARD_VALUE_CLASS,
    label: CARD_LABEL_CLASS,
    finished: 'text-xl font-medium text-center sm:text-2xl md:text-[2.75rem]',
  },
  detail: {
    row: DETAIL_ROW_CLASS,
    value: DETAIL_VALUE_CLASS,
    label: DETAIL_LABEL_CLASS,
    finished: 'text-3xl font-medium text-center sm:text-5xl md:text-7xl',
  },
} as const;

export function MomentTimer({ parts, variant = 'card' }: { parts: RemainingParts; variant?: MomentVariant }) {
  const visible = getVisibleUnits(parts);
  const classes = CLASSES[variant];

  return (
    <div className={classes.row}>
      {visible.length > 0 ? (
        visible.map((unit) => (
          <div key={unit} className="flex flex-col items-center">
            <span className={classes.value} suppressHydrationWarning>
              {parts[unit]}
            </span>
            <span className={classes.label}>{unitLabel(unit, parts[unit])}</span>
          </div>
        ))
      ) : (
        <div className={classes.finished}>Timer finished.</div>
      )}
    </div>
  );
}
