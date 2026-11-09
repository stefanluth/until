'use client';

import { useState } from 'react';

import { useConsent } from './ConsentProvider';

export function useConsentAction<T extends string>(
  action: () => Promise<T>,
  successResults: readonly T[],
  onSuccess?: () => void,
) {
  const { requestConsent } = useConsent();
  const [pending, setPending] = useState(false);

  async function run() {
    if (!(await requestConsent())) {
      return;
    }

    setPending(true);

    try {
      let result = await action();

      if ((result as string) === 'consent') {
        if (!(await requestConsent())) {
          return;
        }
        result = await action();
      }

      if (successResults.includes(result)) {
        onSuccess?.();
      }
    } finally {
      setPending(false);
    }
  }

  return { pending, run };
}
