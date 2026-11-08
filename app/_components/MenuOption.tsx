'use client';

import { Check } from 'lucide-react';

import { type ReactNode } from 'react';

import { MENU_ITEM_CLASS } from './actionStyles';

export function MenuOption({
  selected,
  leading,
  label,
  onSelect,
}: {
  selected: boolean;
  leading: ReactNode;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button className={MENU_ITEM_CLASS} type="button" aria-pressed={selected} onClick={onSelect}>
      {leading}
      <span>{label}</span>
      {selected && <Check className="ml-auto h-4 w-4" aria-hidden />}
    </button>
  );
}
