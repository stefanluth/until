'use client';

import { Download } from 'lucide-react';

import { useState } from 'react';

import { ActionButton } from './ActionButton';
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
  const status = pending ? 'Downloading image…' : failed ? 'Could not download the image' : '';

  return (
    <ActionButton
      icon={Download}
      label={label}
      description={description}
      variant={withLabel ? 'menu' : 'icon'}
      pending={pending}
      status={status}
      onClick={save}
    />
  );
}
