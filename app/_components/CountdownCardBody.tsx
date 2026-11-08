import { unitLabel } from '@/_utils/countdownDisplay';
import { type CountdownUnit, getVisibleUnits } from '@/_utils/duration';
import type { CountdownVariant } from '@/types';

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

export function CountdownCardBody({
  d,
  h,
  m,
  s,
  variant = 'card',
}: {
  d: number;
  h: number;
  m: number;
  s: number;
  variant?: CountdownVariant;
}) {
  const values: Record<CountdownUnit, number> = { days: d, hours: h, minutes: m, seconds: s };
  const visible = getVisibleUnits(values);
  const isDetail = variant === 'detail';

  return (
    <div className={isDetail ? DETAIL_ROW_CLASS : CARD_ROW_CLASS}>
      {visible.length > 0 ? (
        visible.map((unit) => (
          <div key={unit} className="flex flex-col items-center">
            <span className={isDetail ? DETAIL_VALUE_CLASS : CARD_VALUE_CLASS} suppressHydrationWarning>
              {values[unit]}
            </span>
            <span className={isDetail ? DETAIL_LABEL_CLASS : CARD_LABEL_CLASS}>{unitLabel(unit, values[unit])}</span>
          </div>
        ))
      ) : (
        <div
          className={
            isDetail
              ? 'text-3xl font-medium text-center sm:text-5xl md:text-7xl'
              : 'text-xl font-medium text-center sm:text-2xl md:text-[2.75rem]'
          }
        >
          Countdown has ended!
        </div>
      )}
    </div>
  );
}
