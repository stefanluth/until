'use client';

import { BookmarkOff } from 'lucide-react';

import { unsaveMoment } from '@/_utils/momentListClient';

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
  const { pending, run } = useConsentAction(() => unsaveMoment(id), ['removed'], onRemoved);

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
