'use client';

import { Clipboard, ClipboardCheck } from 'lucide-react';

import { useState } from 'react';

export function ShareButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="inline-flex items-center text-white hover:text-gray-200"
      title={copied ? 'Copied!' : 'Copy the URL to this countdown'}
      aria-label="Copy the URL to this countdown"
      onClick={() => {
        navigator.clipboard.writeText(`${location.origin}/${id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6" /> : <Clipboard className="w-5 h-5 sm:w-6 sm:h-6" />}
      <span className="sr-only" role="status">
        {copied ? 'Copied!' : ''}
      </span>
    </button>
  );
}
