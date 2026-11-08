'use client';

import { ClipboardCheck, Image as ImageIcon } from 'lucide-react';

import { useState } from 'react';

import { ICON_BUTTON_CLASS, ICON_CLASS, MENU_ITEM_CLASS } from './actionStyles';
import { useDelayedPending } from './useDelayedPending';

export function CopyImageButton({
  id,
  name,
  date,
  withLabel = false,
}: {
  id: string;
  name: string;
  date: Date;
  withLabel?: boolean;
}) {
  const { pending, start, finish } = useDelayedPending();
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!start()) {
      return;
    }

    setFailed(false);
    setCopied(false);

    try {
      const { copyCountdownImage } = await import('@/_utils/copyCountdownImage');
      await copyCountdownImage({ id, name, date });
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy the countdown image', error);
      setFailed(true);
      setTimeout(() => setFailed(false), 2000);
    } finally {
      finish();
    }
  }

  const label = failed ? 'Copy failed' : pending ? 'Copying image…' : copied ? 'Copied!' : 'Copy image';
  const description = failed
    ? 'Could not copy the image'
    : pending
      ? 'Copying image…'
      : copied
        ? 'Copied!'
        : 'Copy this countdown as an image to the clipboard';

  return (
    <button
      className={withLabel ? MENU_ITEM_CLASS : ICON_BUTTON_CLASS}
      title={description}
      aria-label={description}
      aria-busy={pending}
      disabled={pending}
      onClick={copy}
    >
      {copied ? <ClipboardCheck className={ICON_CLASS} /> : <ImageIcon className={ICON_CLASS} />}
      {withLabel ? (
        <span aria-live="polite">{label}</span>
      ) : (
        <span className="sr-only" role="status">
          {pending ? 'Copying image…' : failed ? 'Could not copy the image' : copied ? 'Copied!' : ''}
        </span>
      )}
    </button>
  );
}
