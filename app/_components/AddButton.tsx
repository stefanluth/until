import dynamic from 'next/dynamic';

import { addCountdown } from '@/app/_actions/addCountdown';

export function AddButtonSSR({ id }: { id: string }) {
  return (
    <button
      className="text-white hover:underline"
      title="Add this countdown to your list"
      onClick={() => addCountdown(id)}
    >
      Add
    </button>
  );
}

export const AddButton = dynamic(() => Promise.resolve(AddButtonSSR), { ssr: false });
