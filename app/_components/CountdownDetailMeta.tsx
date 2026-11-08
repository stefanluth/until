'use client';

import { useSetCountdownMeta } from './CountdownMetaContext';

export function CountdownDetailMeta({ id, name, date }: { id: string; name: string; date: Date }) {
  useSetCountdownMeta(id, name, date);

  return null;
}
