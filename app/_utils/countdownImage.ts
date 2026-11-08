import { formatCountdownDate, unitLabel } from './countdownDisplay.ts';
import type { CountdownImageContent } from './countdownImageTypes.ts';
import { type CountdownParts, getVisibleUnits } from './duration.ts';

const MAX_SLUG_LENGTH = 48;

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

  return {
    name,
    dateLabel: formatCountdownDate(date, locale),
    units,
    ended: units.length === 0,
    url,
  };
}

export function buildCountdownImageFilename(name: string, date: Date): string {
  const slug = slugifyName(name) || 'countdown';
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `until-${slug}-${year}-${month}-${day}.png`;
}

function slugifyName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '');
}
