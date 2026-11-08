'use client';

import { ClipboardCheck, Link } from 'lucide-react';

import { useState } from 'react';

export function LinkButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="inline-flex items-center text-white hover:text-gray-200 p-1 -m-1 sm:p-0 sm:m-0"
      title={copied ? 'Copied!' : 'Copy the URL to this countdown'}
      aria-label="Copy the URL to this countdown"
      onClick={() => {
        navigator.clipboard.writeText(`${location.origin}/${id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <ClipboardCheck className="w-6 h-6" /> : <Link className="w-6 h-6" />}
      <span className="sr-only" role="status">
        {copied ? 'Copied!' : ''}
      </span>
    </button>
  );
}
