'use client';

import { Bookmark } from 'lucide-react';

import { saveMoment } from '@/_utils/momentListClient';

import { ActionButton } from './ActionButton';
import { useConsentAction } from './useConsentAction';

export function AddButton({
  id,
  onAdded,
  showLabel = false,
}: {
  id: string;
  onAdded?: () => void;
  showLabel?: boolean;
}) {
  const { pending, run } = useConsentAction(() => saveMoment(id), ['added', 'exists'], onAdded);

  return (
    <ActionButton
      icon={Bookmark}
      label="Save"
      description="Save this moment to your list"
      variant={showLabel ? 'label' : 'icon'}
      pending={pending}
      onClick={run}
    />
  );
}
