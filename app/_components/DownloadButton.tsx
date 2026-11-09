'use client';

import { Download } from 'lucide-react';

import { ActionButton } from './ActionButton';
import { useMomentImageAction } from './useMomentImageAction';

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
  const { pending, failed, run } = useMomentImageAction(async () => {
    const { downloadMomentImage } = await import('@/_utils/downloadMomentImage');

    await downloadMomentImage({ id, name, date });
  }, 'Failed to save the moment image');

  const label = failed ? 'Download failed' : pending ? 'Downloading image…' : 'Download image';
  const description = failed
    ? 'Could not download the image'
    : pending
      ? 'Downloading image…'
      : 'Download this moment as an image';
  const status = pending ? 'Downloading image…' : failed ? 'Could not download the image' : '';

  return (
    <ActionButton
      icon={Download}
      label={label}
      description={description}
      variant={withLabel ? 'menu' : 'icon'}
      pending={pending}
      status={status}
      onClick={run}
    />
  );
}
