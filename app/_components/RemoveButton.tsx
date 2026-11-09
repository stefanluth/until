'use client';

import { BookmarkOff } from 'lucide-react';

import { removeMoment } from '@/_actions/removeMoment';

import { ActionButton } from './ActionButton';
import { useConsentAction } from './useConsentAction';

export function RemoveButton({
  id,
  onRemoved,
  withLabel = false,
}: {
  id: string;
  onRemoved?: () => void;
  withLabel?: boolean;
}) {
  const { pending, run } = useConsentAction(() => removeMoment(id), ['removed'], onRemoved);

  return (
    <ActionButton
      icon={BookmarkOff}
      label="Remove from list"
      description="Remove this moment from your list"
      variant={withLabel ? 'menu' : 'icon'}
      pending={pending}
      onClick={run}
    />
  );
}
