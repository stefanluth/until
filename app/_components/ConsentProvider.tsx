'use client';

import Cookies from 'js-cookie';

import { type ReactNode, createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { CONSENT_COOKIE, browserCookieOptions, isConsentGranted } from '@/_utils/cookies';

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

  const accept = useCallback(() => {
    Cookies.set(CONSENT_COOKIE, 'true', browserCookieOptions(window.location.protocol));
    finish(true);
  }, [finish]);

  const cancel = useCallback(() => finish(false), [finish]);

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
