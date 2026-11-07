'use client';

import { Bookmark } from 'lucide-react';

import dynamic from 'next/dynamic';

import { addCountdown } from '@/app/_actions/addCountdown';

export function AddButtonSSR({ id }: { id: string }) {
  return (
    <button
      className="inline-flex items-center text-white hover:text-gray-200"
      title="Add this countdown to your list"
      aria-label="Add this countdown to your list"
      onClick={() => addCountdown(id)}
    >
      <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
  );
}

export const AddButton = dynamic(() => Promise.resolve(AddButtonSSR), { ssr: false });
