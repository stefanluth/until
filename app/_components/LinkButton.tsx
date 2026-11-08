'use client';

import { ClipboardCheck, Link } from 'lucide-react';

import { useState } from 'react';

import { ICON_BUTTON_CLASS, ICON_CLASS, MENU_ITEM_CLASS } from './actionStyles';

export function LinkButton({ id, withLabel = false }: { id: string; withLabel?: boolean }) {
  const [copied, setCopied] = useState(false);
  const label = copied ? 'Copied!' : 'Copy link';

  return (
    <button
      className={withLabel ? MENU_ITEM_CLASS : ICON_BUTTON_CLASS}
      title="Copy the URL to this countdown"
      aria-label="Copy the URL to this countdown"
      onClick={() => {
        navigator.clipboard.writeText(`${location.origin}/${id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <ClipboardCheck className={ICON_CLASS} /> : <Link className={ICON_CLASS} />}
      {withLabel ? (
        <span aria-live="polite">{label}</span>
      ) : (
        <span className="sr-only" role="status">
          {copied ? 'Copied!' : ''}
        </span>
      )}
    </button>
  );
}
