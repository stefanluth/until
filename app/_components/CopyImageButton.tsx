'use client';

import { Clipboard, ClipboardCheck } from 'lucide-react';

import { useState } from 'react';

export function CopyImageButton({ id, name, date }: { id: string; name: string; date: Date }) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    setPending(true);
    setFailed(false);
    setCopied(false);

    try {
      const { copyCountdownImage } = await import('@/_utils/copyCountdownImage');
      await copyCountdownImage({ id, name, date });
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy the countdown image', error);
      setFailed(true);
      setTimeout(() => setFailed(false), 2000);
    } finally {
      setPending(false);
    }
  }

  const label = failed
    ? 'Could not copy the image'
    : pending
      ? 'Copying image…'
      : copied
        ? 'Copied!'
        : 'Copy this countdown as an image';

  return (
    <button
      className="inline-flex items-center text-white hover:text-gray-200 disabled:opacity-60"
      title={label}
      aria-label={label}
      aria-busy={pending}
      disabled={pending}
      onClick={copy}
    >
      {copied ? <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6" /> : <Clipboard className="w-5 h-5 sm:w-6 sm:h-6" />}
      <span className="sr-only" role="status">
        {pending ? 'Copying image…' : failed ? 'Could not copy the image' : copied ? 'Copied!' : ''}
      </span>
    </button>
  );
}
