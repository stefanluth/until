'use client';

import { Palette } from 'lucide-react';

import { useState } from 'react';

import {
  DEFAULT_THEME,
  THEMES,
  type ThemeId,
  applyTheme,
  isThemeId,
  readStoredTheme,
  storeTheme,
} from '@/_utils/themes';

import { Menu, useMenuClose } from './Menu';
import { MenuOption } from './MenuOption';
import { FOOTER_ICON_BUTTON_CLASS, ICON_CLASS } from './actionStyles';

function currentTheme(): ThemeId {
  if (typeof document === 'undefined') {
    return DEFAULT_THEME;
  }

  const value = document.documentElement.dataset.theme;

  return isThemeId(value) ? value : readStoredTheme();
}

function ThemeOptions({ theme, apply }: { theme: ThemeId; apply: (id: ThemeId) => void }) {
  const close = useMenuClose();

  return THEMES.map((option) => (
    <MenuOption
      key={option.id}
      selected={theme === option.id}
      leading={
        <span
          className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/20"
          style={{ background: option.swatch }}
          aria-hidden
        />
      }
      label={option.label}
      onSelect={() => {
        apply(option.id);
        close();
      }}
    />
  ));
}

export function ThemePicker() {
  const [theme, setTheme] = useState<ThemeId>(currentTheme);

  function selectTheme(id: ThemeId) {
    applyTheme(id);
    storeTheme(id);
    setTheme(id);
  }

  return (
    <Menu
      label="Themes"
      placement="top"
      widthClass="w-40"
      trigger={({ triggerRef, triggerProps }) => (
        <button
          ref={triggerRef}
          {...triggerProps}
          className={FOOTER_ICON_BUTTON_CLASS}
          title="Change theme"
          aria-label="Change theme"
        >
          <Palette className={ICON_CLASS} aria-hidden />
        </button>
      )}
    >
      <ThemeOptions theme={theme} apply={selectTheme} />
    </Menu>
  );
}
