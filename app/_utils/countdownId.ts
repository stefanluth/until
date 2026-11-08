import { createHash } from 'node:crypto';

const MAX_SLUG_LENGTH = 48;
const EMPTY_SLUG = 'countdown';

function slugify(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '');

  return slug || EMPTY_SLUG;
}

export function createCountdownId(name: string, date: Date): string {
  const hash = createHash('sha256')
    .update(name + date.toISOString())
    .digest('hex')
    .slice(0, 8);

  return `${slugify(name)}-${hash}`;
}
