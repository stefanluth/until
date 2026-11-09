'use client';

import { ClipboardCheck, Image as ImageIcon } from 'lucide-react';

import { useState } from 'react';

import { ActionButton } from './ActionButton';
import { useMomentImageAction } from './useMomentImageAction';

type CopyStatus = 'idle' | 'copying' | 'copied' | 'failed';

const COPY_STATE: Record<CopyStatus, { label: string; description: string; announcement: string }> = {
  idle: { label: 'Copy image', description: 'Copy this moment as an image to the clipboard', announcement: '' },
  copying: { label: 'Copying image…', description: 'Copying image…', announcement: 'Copying image…' },
  copied: { label: 'Copied!', description: 'Copied!', announcement: 'Copied!' },
  failed: { label: 'Copy failed', description: 'Could not copy the image', announcement: 'Could not copy the image' },
};

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
  const [copied, setCopied] = useState(false);
  const { pending, failed, run } = useMomentImageAction(async () => {
    setCopied(false);

    const { copyMomentImage } = await import('@/_utils/downloadMomentImage');

    await copyMomentImage({ id, name, date });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, 'Failed to copy the moment image');
  const status: CopyStatus = failed ? 'failed' : pending ? 'copying' : copied ? 'copied' : 'idle';
  const { label, description, announcement } = COPY_STATE[status];

  return (
    <ActionButton
      icon={status === 'copied' ? ClipboardCheck : ImageIcon}
      label={label}
      description={description}
      variant={withLabel ? 'menu' : 'icon'}
      pending={pending}
      status={announcement}
      onClick={run}
    />
  );
}
