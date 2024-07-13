import dynamic from 'next/dynamic';

import { removeCountdown } from '@/app/_actions/removeCountdown';

function RemoveButtonSSR({ id }: { id: string }) {
  return (
    <button
      className="text-white hover:underline"
      title="Remove this countdown from your list"
      onClick={() => removeCountdown(id)}
    >
      Remove
    </button>
  );
}

export const RemoveButton = dynamic(() => Promise.resolve(RemoveButtonSSR), { ssr: false });
