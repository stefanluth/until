'use client';

import { Bookmark } from 'lucide-react';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import { addCountdown } from '@/_actions/addCountdown';

import { useConsent } from './ConsentProvider';

export function AddButtonSSR({ id, onAdded }: { id: string; onAdded?: () => void }) {
  const { requestConsent } = useConsent();
  const [pending, setPending] = useState(false);

  async function add() {
    if (!(await requestConsent())) {
      return;
    }

    setPending(true);

    try {
      let result = await addCountdown(id);

      if (result === 'consent') {
        if (!(await requestConsent())) {
          return;
        }
        result = await addCountdown(id);
      }

      if (result === 'added' || result === 'exists') {
        onAdded?.();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      className="inline-flex items-center text-white hover:text-gray-200 disabled:opacity-60"
      title="Save this countdown to your list"
      aria-label="Save this countdown to your list"
      onClick={add}
      disabled={pending}
    >
      <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
  );
}

export const AddButton = dynamic(() => Promise.resolve(AddButtonSSR), { ssr: false });
