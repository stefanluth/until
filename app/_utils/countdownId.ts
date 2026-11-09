import { createHash } from 'node:crypto';

import { slugify } from './slug.ts';

export function createCountdownId(name: string, date: Date): string {
  const hash = createHash('sha256')
    .update(name + date.toISOString())
    .digest('hex')
    .slice(0, 8);

  return `${slugify(name)}-${hash}`;
}
