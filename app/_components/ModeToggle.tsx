'use client';

import { Monitor, Moon, Sun } from 'lucide-react';

import { useEffect, useState } from 'react';

import { type Mode, applyMode, isMode, storeMode } from '@/_utils/themes';

import { Menu, useMenuClose } from './Menu';
import { MenuOption } from './MenuOption';
import { FOOTER_ICON_BUTTON_CLASS, ICON_CLASS } from './actionStyles';

const MODE_OPTIONS = [
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
  { id: 'system', label: 'System', Icon: Monitor },
] as const;

function currentMode(): Mode {
  if (typeof document === 'undefined') {
    return 'system';
  }

  const value = document.documentElement.dataset.mode;

  return isMode(value) ? value : 'system';
}

function ModeOptions({ mode, apply }: { mode: Mode; apply: (mode: Mode) => void }) {
  const close = useMenuClose();

  return MODE_OPTIONS.map(({ id, label, Icon }) => (
    <MenuOption
      key={id}
      selected={mode === id}
      leading={<Icon className="h-4 w-4" aria-hidden />}
      label={label}
      onSelect={() => {
        apply(id);
        close();
      }}
    />
  ));
}

export function ModeToggle() {
  const [mode, setMode] = useState<Mode>(currentMode);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    function sync() {
      if (currentMode() === 'system') {
        applyMode('system');
      }
    }

    sync();
    media.addEventListener('change', sync);

    return () => media.removeEventListener('change', sync);
  }, []);

  function selectMode(next: Mode) {
    storeMode(next);
    applyMode(next);
    setMode(next);
  }

  return (
    <Menu
      label="Color mode"
      placement="top"
      widthClass="w-40"
      trigger={({ triggerRef, triggerProps }) => (
        <button
          ref={triggerRef}
          {...triggerProps}
          className={FOOTER_ICON_BUTTON_CLASS}
          title="Change color mode"
          aria-label="Change color mode"
        >
          <Sun className={`${ICON_CLASS} hidden [[data-mode=light]_&]:block`} aria-hidden />
          <Moon className={`${ICON_CLASS} hidden [[data-mode=dark]_&]:block`} aria-hidden />
          <Monitor className={`${ICON_CLASS} hidden [[data-mode=system]_&]:block`} aria-hidden />
        </button>
      )}
    >
      <ModeOptions mode={mode} apply={selectMode} />
    </Menu>
  );
}
