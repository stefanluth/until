import { formatCountdownDateParts, unitLabel } from './countdownDisplay.ts';
import type { CountdownImageContent } from './countdownImageTypes.ts';
import { type CountdownParts, getVisibleUnits } from './duration.ts';
import { slugify } from './slug.ts';

export function buildCountdownImageContent({
  name,
  date,
  remaining,
  url,
  locale,
}: {
  name: string;
  date: Date;
  remaining: CountdownParts;
  url?: string;
  locale?: string;
}): CountdownImageContent {
  const units = getVisibleUnits(remaining).map((unit) => ({
    unit,
    value: remaining[unit],
    label: unitLabel(unit, remaining[unit]),
  }));
  const { date: dateLabel, time: timeLabel } = formatCountdownDateParts(date, locale);

  return {
    name,
    dateLabel,
    timeLabel,
    units,
    ended: units.length === 0,
    url,
  };
}

export function buildCountdownImageFilename(name: string, date: Date): string {
  const slug = slugify(name);
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `until-${slug}-${year}-${month}-${day}.png`;
}
