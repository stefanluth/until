'use client';

import { BookmarkOff } from 'lucide-react';

import dynamic from 'next/dynamic';

import { removeCountdown } from '@/app/_actions/removeCountdown';

function RemoveButtonSSR({ id }: { id: string }) {
  return (
    <button
      className="inline-flex items-center text-white hover:text-gray-200"
      title="Remove this countdown from your list"
      aria-label="Remove this countdown from your list"
      onClick={() => removeCountdown(id)}
    >
      <BookmarkOff className="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
  );
}

export const RemoveButton = dynamic(() => Promise.resolve(RemoveButtonSSR), { ssr: false });
