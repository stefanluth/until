'use client';

import { useState } from 'react';

export function ShareButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="text-white hover:underline w-14 hover:text-gray-200"
      title="Copy the URL to this countdown"
      onClick={() => {
        navigator.clipboard.writeText(`${location.origin}/${id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
