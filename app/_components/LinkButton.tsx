'use client';

import { ClipboardCheck, Link } from 'lucide-react';

import { useState } from 'react';

import { ActionButton } from './ActionButton';

const LINK_STATE = {
  idle: { icon: Link, label: 'Copy link', announcement: '' },
  copied: { icon: ClipboardCheck, label: 'Copied!', announcement: 'Copied!' },
} as const;

export function LinkButton({ id, withLabel = false }: { id: string; withLabel?: boolean }) {
  const [copied, setCopied] = useState(false);
  const { icon, label, announcement } = LINK_STATE[copied ? 'copied' : 'idle'];

  return (
    <ActionButton
      icon={icon}
      label={label}
      description="Copy the URL to this countdown"
      variant={withLabel ? 'menu' : 'icon'}
      status={announcement}
      onClick={() => {
        navigator.clipboard.writeText(`${location.origin}/${id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    />
  );
}
