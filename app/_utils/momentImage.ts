import { formatDateParts } from './momentDisplay.ts';
import { slugify } from './slug.ts';
import { type RemainingParts, type TimeUnit, getVisibleUnits } from './timer.ts';
import { unitLabel } from './timerDisplay.ts';

export type MomentImageContent = {
  name: string;
  dateLabel: string;
  timeLabel: string | null;
  units: { unit: TimeUnit; value: number; label: string }[];
  url?: string;
};

export type MomentImageTheme = {
  backgroundStart: string;
  backgroundEnd: string;
  foreground: string;
  fontFamily: string;
};

export function buildMomentImageContent({
  name,
  date,
  remaining,
  url,
  locale,
  offsetMinutes,
}: {
  name: string;
  date: Date;
  remaining: RemainingParts;
  url?: string;
  locale?: string;
  offsetMinutes?: number;
}): MomentImageContent {
  const units = getVisibleUnits(remaining).map((unit) => ({
    unit,
    value: remaining[unit],
    label: unitLabel(unit, remaining[unit]),
  }));
  const displayDate = offsetMinutes === undefined ? date : new Date(date.getTime() + offsetMinutes * 60_000);
  const { date: dateLabel, time: timeLabel } = formatDateParts(
    displayDate,
    locale,
    offsetMinutes === undefined ? undefined : 'UTC',
  );

  return {
    name,
    dateLabel,
    timeLabel,
    units,
    url,
  };
}

export function buildMomentImageFilename(name: string, date: Date): string {
  const slug = slugify(name);
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `until-${slug}-${year}-${month}-${day}.png`;
}
