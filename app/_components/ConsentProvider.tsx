'use client';

import Cookies from 'js-cookie';

import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { usePathname } from 'next/navigation';

import { grantConsent } from '@/_actions/grantConsent';
import { CONSENT_COOKIE, isConsentGranted } from '@/_utils/cookies';

import { ConsentDialog } from './ConsentDialog';

type ConsentContextValue = {
  requestConsent: () => Promise<boolean>;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error('useConsent must be used within ConsentProvider');
  }

  return context;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const resolverRef = useRef<((granted: boolean) => void) | null>(null);

  const isGranted = useCallback(() => isConsentGranted(Cookies.get(CONSENT_COOKIE)), []);

  const requestConsent = useCallback((): Promise<boolean> => {
    if (isGranted()) {
      return Promise.resolve(true);
    }

    setOpen(true);

    return new Promise<boolean>((resolve) => {
      resolverRef.current?.(false);
      resolverRef.current = resolve;
    });
  }, [isGranted]);

  const finish = useCallback((granted: boolean) => {
    setOpen(false);

    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(granted);
  }, []);

  const accept = useCallback(async () => {
    await grantConsent();
    finish(true);
  }, [finish]);

  const cancel = useCallback(() => finish(false), [finish]);

  useEffect(() => {
    if (pathname === '/' && !isGranted()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, [pathname, isGranted]);

  const value = useMemo(() => ({ requestConsent }), [requestConsent]);

  return (
    <ConsentContext.Provider value={value}>
      <div className="contents" inert={open}>
        {children}
      </div>
      {open && <ConsentDialog onAccept={accept} onCancel={cancel} />}
    </ConsentContext.Provider>
  );
}
