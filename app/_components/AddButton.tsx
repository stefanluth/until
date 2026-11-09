'use client';

import { Bookmark } from 'lucide-react';

import { saveMoment } from '@/_utils/momentListClient';

import { ActionButton } from './ActionButton';
import { useConsentAction } from './useConsentAction';

export function AddButton({
  id,
  onAdded,
  withLabel = false,
}: {
  id: string;
  onAdded?: () => void;
  withLabel?: boolean;
}) {
  const { pending, run } = useConsentAction(() => saveMoment(id), ['added', 'exists'], onAdded);

  return (
    <ActionButton
      icon={Bookmark}
      label="Save to list"
      description="Save this moment to your list"
      variant={withLabel ? 'menu' : 'icon'}
      pending={pending}
      onClick={run}
    />
  );
}
