'use client';

import { Download } from 'lucide-react';

import { useState } from 'react';

import { ICON_BUTTON_CLASS, ICON_CLASS, MENU_ITEM_CLASS } from './actionStyles';
import { useDelayedPending } from './useDelayedPending';

export function DownloadButton({
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

  async function save() {
    if (!start()) {
      return;
    }

    setFailed(false);

    try {
      const { downloadCountdownImage } = await import('@/_utils/downloadCountdownImage');
      await downloadCountdownImage({ id, name, date });
    } catch (error) {
      console.error('Failed to save the countdown image', error);
      setFailed(true);
      setTimeout(() => setFailed(false), 2000);
    } finally {
      finish();
    }
  }

  const label = failed ? 'Download failed' : pending ? 'Downloading image…' : 'Download image';
  const description = failed
    ? 'Could not download the image'
    : pending
      ? 'Downloading image…'
      : 'Download this countdown as an image';

  return (
    <button
      className={withLabel ? MENU_ITEM_CLASS : ICON_BUTTON_CLASS}
      title={description}
      aria-label={description}
      aria-busy={pending}
      disabled={pending}
      onClick={save}
    >
      <Download className={ICON_CLASS} />
      {withLabel ? (
        <span aria-live="polite">{label}</span>
      ) : (
        <span className="sr-only" role="status">
          {pending ? 'Downloading image…' : failed ? 'Could not download the image' : ''}
        </span>
      )}
    </button>
  );
}
