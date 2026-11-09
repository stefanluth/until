'use client';

import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { Moment } from '@/types';

type MomentMetaContextValue = {
  meta: Moment | null;
  setMeta: (meta: Moment | null) => void;
};

const MomentMetaContext = createContext<MomentMetaContextValue | null>(null);

export function MomentMetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<Moment | null>(null);
  const value = useMemo(() => ({ meta, setMeta }), [meta]);

  return <MomentMetaContext.Provider value={value}>{children}</MomentMetaContext.Provider>;
}

export function useMomentMeta(): Moment | null {
  return useMomentMetaContext().meta;
}

export function useSetMomentMeta(id: string, name: string, date: Date): void {
  const { setMeta } = useMomentMetaContext();
  const time = date.getTime();

  useEffect(() => {
    setMeta({ id, name, date: new Date(time) });

    return () => setMeta(null);
  }, [setMeta, id, name, time]);
}

function useMomentMetaContext(): MomentMetaContextValue {
  const context = useContext(MomentMetaContext);

  if (!context) {
    throw new Error('useMomentMeta must be used within MomentMetaProvider');
  }

  return context;
}
