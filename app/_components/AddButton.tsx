'use client';

import { Bookmark } from 'lucide-react';

import { addCountdown } from '@/_actions/addCountdown';

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
  const { pending, run } = useConsentAction(() => addCountdown(id), ['added', 'exists'], onAdded);

  return (
    <ActionButton
      icon={Bookmark}
      label="Save"
      description="Save this countdown to your list"
      variant={showLabel ? 'label' : 'icon'}
      pending={pending}
      onClick={run}
    />
  );
}
