'use client';

import { Bookmark } from 'lucide-react';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import { addCountdown } from '@/_actions/addCountdown';

import { useConsent } from './ConsentProvider';
import { ICON_BUTTON_CLASS, ICON_CLASS, LABEL_BUTTON_CLASS } from './actionStyles';

export function AddButtonSSR({
  id,
  onAdded,
  showLabel = false,
}: {
  id: string;
  onAdded?: () => void;
  showLabel?: boolean;
}) {
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
      className={showLabel ? LABEL_BUTTON_CLASS : ICON_BUTTON_CLASS}
      title="Save this countdown to your list"
      aria-label="Save this countdown to your list"
      onClick={add}
      disabled={pending}
    >
      <Bookmark className={ICON_CLASS} />
      {showLabel && <span>Save</span>}
    </button>
  );
}

export const AddButton = dynamic(() => Promise.resolve(AddButtonSSR), { ssr: false });
