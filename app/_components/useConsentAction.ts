'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useConsent } from './ConsentProvider';

export function useConsentAction<T extends string>(
  action: () => T | Promise<T>,
  successResults: readonly T[],
  onSuccess?: () => void,
) {
  const router = useRouter();
  const { requestConsent } = useConsent();
  const [pending, setPending] = useState(false);

  async function run() {
    if (!(await requestConsent())) {
      return;
    }

    setPending(true);

    try {
      const result = await action();

      if (successResults.includes(result)) {
        onSuccess?.();
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return { pending, run };
}
