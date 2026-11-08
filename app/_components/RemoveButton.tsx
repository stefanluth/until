'use client';

import { BookmarkOff } from 'lucide-react';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import { removeCountdown } from '@/_actions/removeCountdown';

import { useConsent } from './ConsentProvider';
import { ICON_BUTTON_CLASS, ICON_CLASS, MENU_ITEM_CLASS } from './actionStyles';

function RemoveButtonSSR({
  id,
  onRemoved,
  withLabel = false,
}: {
  id: string;
  onRemoved?: () => void;
  withLabel?: boolean;
}) {
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
      className={withLabel ? MENU_ITEM_CLASS : ICON_BUTTON_CLASS}
      title="Remove this countdown from your list"
      aria-label="Remove this countdown from your list"
      onClick={remove}
      disabled={pending}
    >
      <BookmarkOff className={ICON_CLASS} />
      {withLabel && <span>Remove from list</span>}
    </button>
  );
}

export const RemoveButton = dynamic(() => Promise.resolve(RemoveButtonSSR), { ssr: false });
