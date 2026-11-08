'use client';

import { Download } from 'lucide-react';

import { useState } from 'react';

export function DownloadButton({ id, name, date }: { id: string; name: string; date: Date }) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function save() {
    setPending(true);
    setFailed(false);

    try {
      const { downloadCountdownImage } = await import('@/_utils/downloadCountdownImage');
      await downloadCountdownImage({ id, name, date });
    } catch (error) {
      console.error('Failed to save the countdown image', error);
      setFailed(true);
      setTimeout(() => setFailed(false), 2000);
    } finally {
      setPending(false);
    }
  }

  const label = failed ? 'Could not save the image' : pending ? 'Saving image…' : 'Save this countdown as an image';

  return (
    <button
      className="inline-flex items-center text-white hover:text-gray-200 disabled:opacity-60"
      title={label}
      aria-label={label}
      aria-busy={pending}
      disabled={pending}
      onClick={save}
    >
      <Download className="w-5 h-5 sm:w-6 sm:h-6" />
      <span className="sr-only" role="status">
        {pending ? 'Saving image…' : failed ? 'Could not save the image' : ''}
      </span>
    </button>
  );
}
