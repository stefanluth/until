'use client';

import { useEffect, useRef, useState } from 'react';

const DEFAULT_DELAY_MS = 150;

export function useDelayedPending(delayMs = DEFAULT_DELAY_MS) {
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  function start(): boolean {
    if (busyRef.current) {
      return false;
    }

    busyRef.current = true;
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;

      if (mountedRef.current) {
        setPending(true);
      }
    }, delayMs);

    return true;
  }

  function finish(): void {
    busyRef.current = false;

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (mountedRef.current) {
      setPending(false);
    }
  }

  return { pending, start, finish };
}
