'use client';

import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CountdownMeta = {
  id: string;
  name: string;
  date: Date;
};

type CountdownMetaContextValue = {
  meta: CountdownMeta | null;
  setMeta: (meta: CountdownMeta | null) => void;
};

const CountdownMetaContext = createContext<CountdownMetaContextValue | null>(null);

export function CountdownMetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<CountdownMeta | null>(null);
  const value = useMemo(() => ({ meta, setMeta }), [meta]);

  return <CountdownMetaContext.Provider value={value}>{children}</CountdownMetaContext.Provider>;
}

export function useCountdownMeta(): CountdownMeta | null {
  return useCountdownMetaContext().meta;
}

export function useSetCountdownMeta(id: string, name: string, date: Date): void {
  const { setMeta } = useCountdownMetaContext();
  const time = date.getTime();

  useEffect(() => {
    setMeta({ id, name, date: new Date(time) });

    return () => setMeta(null);
  }, [setMeta, id, name, time]);
}

function useCountdownMetaContext(): CountdownMetaContextValue {
  const context = useContext(CountdownMetaContext);

  if (!context) {
    throw new Error('useCountdownMeta must be used within CountdownMetaProvider');
  }

  return context;
}
