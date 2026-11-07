'use client';

import { BookmarkOff } from 'lucide-react';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import { removeCountdown } from '@/_actions/removeCountdown';

import { useConsent } from './ConsentProvider';

function RemoveButtonSSR({ id, onRemoved }: { id: string; onRemoved?: () => void }) {
  const { requestConsent } = useConsent();
  const [pending, setPending] = useState(false);

  async function remove() {
    if (!(await requestConsent())) {
      return;
    }

    setPending(true);

    try {
      let result = await removeCountdown(id);

      if (result === 'consent') {
        if (!(await requestConsent())) {
          return;
        }
        result = await removeCountdown(id);
      }

      if (result === 'removed') {
        onRemoved?.();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      className="inline-flex items-center text-white hover:text-gray-200 disabled:opacity-60"
      title="Remove this countdown from your list"
      aria-label="Remove this countdown from your list"
      onClick={remove}
      disabled={pending}
    >
      <BookmarkOff className="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
  );
}

export const RemoveButton = dynamic(() => Promise.resolve(RemoveButtonSSR), { ssr: false });
