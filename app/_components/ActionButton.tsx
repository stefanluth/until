'use client';

import type { LucideIcon } from 'lucide-react';

import { ICON_BUTTON_CLASS, ICON_CLASS, MENU_ITEM_CLASS } from './actionStyles';

type ActionButtonVariant = 'icon' | 'menu' | 'label';

const CLASS_BY_VARIANT: Record<ActionButtonVariant, string> = {
  icon: ICON_BUTTON_CLASS,
  menu: MENU_ITEM_CLASS,
  label:
    'inline-flex h-11 items-center justify-center gap-2 rounded-full px-3.5 text-sm font-medium text-current transition-colors hover:bg-black/5 active:bg-black/10 disabled:opacity-60 dark:hover:bg-white/10 dark:active:bg-white/15',
};

export function ActionButton({
  icon: Icon,
  label,
  description,
  variant = 'icon',
  pending = false,
  status = '',
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  variant?: ActionButtonVariant;
  pending?: boolean;
  status?: string;
  onClick: () => void;
}) {
  const className = CLASS_BY_VARIANT[variant];

  return (
    <button
      className={className}
      title={description}
      aria-label={description}
      aria-busy={pending}
      disabled={pending}
      onClick={onClick}
    >
      <Icon className={ICON_CLASS} />
      {variant === 'icon' ? (
        <span className="sr-only" role="status">
          {status}
        </span>
      ) : (
        <span aria-live="polite">{label}</span>
      )}
    </button>
  );
}
