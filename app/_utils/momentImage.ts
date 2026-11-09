import { formatMomentDateParts } from './momentDisplay.ts';
import type { MomentImageContent } from './momentImageTypes.ts';
import { slugify } from './slug.ts';
import { type RemainingParts, getVisibleUnits } from './timer.ts';
import { unitLabel } from './timerDisplay.ts';

export function buildMomentImageContent({
  name,
  date,
  remaining,
  url,
  locale,
}: {
  name: string;
  date: Date;
  remaining: RemainingParts;
  url?: string;
  locale?: string;
}): MomentImageContent {
  const units = getVisibleUnits(remaining).map((unit) => ({
    unit,
    value: remaining[unit],
    label: unitLabel(unit, remaining[unit]),
  }));
  const { date: dateLabel, time: timeLabel } = formatMomentDateParts(date, locale);

  return {
    name,
    dateLabel,
    timeLabel,
    units,
    ended: units.length === 0,
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
