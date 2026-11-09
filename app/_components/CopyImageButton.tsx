'use client';

import { ClipboardCheck, Image as ImageIcon } from 'lucide-react';

import { useState } from 'react';

import { ActionButton } from './ActionButton';
import { useDelayedPending } from './useDelayedPending';

type CopyStatus = 'idle' | 'copying' | 'copied' | 'failed';

const COPY_STATE: Record<CopyStatus, { label: string; description: string; announcement: string }> = {
  idle: { label: 'Copy image', description: 'Copy this countdown as an image to the clipboard', announcement: '' },
  copying: { label: 'Copying image…', description: 'Copying image…', announcement: 'Copying image…' },
  copied: { label: 'Copied!', description: 'Copied!', announcement: 'Copied!' },
  failed: { label: 'Copy failed', description: 'Could not copy the image', announcement: 'Could not copy the image' },
};

function getCopyStatus(failed: boolean, pending: boolean, copied: boolean): CopyStatus {
  if (failed) {
    return 'failed';
  }

  if (pending) {
    return 'copying';
  }

  if (copied) {
    return 'copied';
  }

  return 'idle';
}

function useCopyImage({ id, name, date }: { id: string; name: string; date: Date }) {
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
      const { copyCountdownImage } = await import('@/_utils/downloadCountdownImage');
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

  return { pending, status: getCopyStatus(failed, pending, copied), copy };
}

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
  const { pending, status, copy } = useCopyImage({ id, name, date });
  const { label, description, announcement } = COPY_STATE[status];

  return (
    <ActionButton
      icon={status === 'copied' ? ClipboardCheck : ImageIcon}
      label={label}
      description={description}
      variant={withLabel ? 'menu' : 'icon'}
      pending={pending}
      status={announcement}
      onClick={copy}
    />
  );
}
