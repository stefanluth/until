'use client';

import { useSetMomentMeta } from './MomentMetaContext';

export function MomentDetailMeta({ id, name, date }: { id: string; name: string; date: Date }) {
  useSetMomentMeta(id, name, date);

  return null;
}
