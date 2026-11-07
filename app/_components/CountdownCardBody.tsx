import type { CountdownVariant } from '@/types';

const CARD_ROW_CLASS = 'flex flex-1 w-full flex-wrap items-center justify-center gap-x-6 gap-y-4 p-4 sm:gap-x-8 sm:p-5';
const CARD_VALUE_CLASS = 'text-5xl md:text-[3.25rem] leading-none tabular-nums';
const CARD_LABEL_CLASS = 'text-base uppercase tracking-wide';
const DETAIL_ROW_CLASS =
  'flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-12 sm:gap-y-8 lg:gap-x-16 mt-10 sm:mt-14';
const DETAIL_VALUE_CLASS = 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none tabular-nums';
const DETAIL_LABEL_CLASS = 'text-sm sm:text-base md:text-lg lg:text-xl uppercase tracking-[0.2em]';

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
  const parts = [
    { value: d, label: 'days' },
    { value: h, label: 'hours' },
    { value: m, label: 'minutes' },
    { value: s, label: 'seconds' },
  ];
  const first = parts.findIndex((part) => part.value > 0);
  const visible = first < 0 ? [] : first === 0 ? parts.slice(0, 1) : parts.slice(first);
  const isDetail = variant === 'detail';

  return (
    <div className={isDetail ? DETAIL_ROW_CLASS : CARD_ROW_CLASS}>
      {visible.length > 0 ? (
        visible.map((part) => (
          <div key={part.label} className="flex flex-col items-center">
            <span className={isDetail ? DETAIL_VALUE_CLASS : CARD_VALUE_CLASS} suppressHydrationWarning>
              {part.value}
            </span>
            <span className={isDetail ? DETAIL_LABEL_CLASS : CARD_LABEL_CLASS}>{part.label}</span>
          </div>
        ))
      ) : (
        <div
          className={
            isDetail
              ? 'text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-center'
              : 'text-3xl md:text-[2.75rem] text-center'
          }
        >
          Countdown has ended!
        </div>
      )}
    </div>
  );
}
