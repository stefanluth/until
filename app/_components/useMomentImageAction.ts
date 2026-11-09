'use client';

import { useState } from 'react';

import { useDelayedPending } from './useDelayedPending';

export function useMomentImageAction(action: () => Promise<void>, errorMessage: string) {
  const { pending, start, finish } = useDelayedPending();
  const [failed, setFailed] = useState(false);

  async function run(): Promise<void> {
    if (!start()) {
      return;
    }

    setFailed(false);

    try {
      await action();
    } catch (error) {
      console.error(errorMessage, error);
      setFailed(true);
      setTimeout(() => setFailed(false), 2000);
    } finally {
      finish();
    }
  }

  return { pending, failed, run };
}
