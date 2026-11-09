'use client';

import type { LucideIcon } from 'lucide-react';

import { ICON_BUTTON_CLASS, ICON_CLASS, MENU_ITEM_CLASS } from './actionStyles';

type ActionButtonVariant = 'icon' | 'menu';

const CLASS_BY_VARIANT: Record<ActionButtonVariant, string> = {
  icon: ICON_BUTTON_CLASS,
  menu: MENU_ITEM_CLASS,
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
