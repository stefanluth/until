'use client';

import { ClipboardCheck, Image as ImageIcon } from 'lucide-react';

import { useState } from 'react';

import { ICON_BUTTON_CLASS, ICON_CLASS, MENU_ITEM_CLASS } from './actionStyles';
import { useDelayedPending } from './useDelayedPending';

type CopyStatus = 'idle' | 'copying' | 'copied' | 'failed';

const COPY_LABEL: Record<CopyStatus, string> = {
  idle: 'Copy image',
  copying: 'Copying image…',
  copied: 'Copied!',
  failed: 'Copy failed',
};

const COPY_DESCRIPTION: Record<CopyStatus, string> = {
  idle: 'Copy this countdown as an image to the clipboard',
  copying: 'Copying image…',
  copied: 'Copied!',
  failed: 'Could not copy the image',
};

const COPY_ANNOUNCEMENT: Record<CopyStatus, string> = {
  idle: '',
  copying: 'Copying image…',
  copied: 'Copied!',
  failed: 'Could not copy the image',
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
  const Icon = status === 'copied' ? ClipboardCheck : ImageIcon;

  return (
    <button
      className={withLabel ? MENU_ITEM_CLASS : ICON_BUTTON_CLASS}
      title={COPY_DESCRIPTION[status]}
      aria-label={COPY_DESCRIPTION[status]}
      aria-busy={pending}
      disabled={pending}
      onClick={copy}
    >
      <Icon className={ICON_CLASS} />
      {withLabel ? (
        <span aria-live="polite">{COPY_LABEL[status]}</span>
      ) : (
        <span className="sr-only" role="status">
          {COPY_ANNOUNCEMENT[status]}
        </span>
      )}
    </button>
  );
}
