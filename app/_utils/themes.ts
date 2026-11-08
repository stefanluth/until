export const THEME_STORAGE_KEY = 'until-theme';
export const MODE_STORAGE_KEY = 'until-mode';

export type ThemeId = 'default' | 'sunset' | 'ocean' | 'forest';

export const MODES = ['light', 'dark', 'system'] as const;

export type Mode = (typeof MODES)[number];
export type Appearance = 'light' | 'dark';

export type ThemeDefinition = {
  id: ThemeId;
  label: string;
  swatch: string;
};

export const THEMES: readonly ThemeDefinition[] = [
  { id: 'default', label: 'Default', swatch: 'linear-gradient(135deg, #d8b4fe, #6b21a8)' },
  { id: 'sunset', label: 'Sunset', swatch: 'linear-gradient(135deg, #fdba74, #ea580c)' },
  { id: 'ocean', label: 'Ocean', swatch: 'linear-gradient(135deg, #7dd3fc, #2563eb)' },
  { id: 'forest', label: 'Forest', swatch: 'linear-gradient(135deg, #6ee7b7, #047857)' },
];

export const DEFAULT_THEME: ThemeId = 'default';
export const DEFAULT_MODE: Mode = 'system';

const THEME_IDS: ReadonlySet<string> = new Set<string>(THEMES.map((theme) => theme.id));
const MODE_IDS: ReadonlySet<string> = new Set<string>(MODES);

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
type ThemeRoot = { dataset: { theme?: string } };
type ModeRoot = { dataset: { mode?: string; appearance?: string } };

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEME_IDS.has(value);
}

export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && MODE_IDS.has(value);
}

function getStorage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function readStoredTheme(storage: StorageLike | null = getStorage()): ThemeId {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY);

    return isThemeId(value) ? value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function readStoredMode(storage: StorageLike | null = getStorage()): Mode {
  try {
    const value = storage?.getItem(MODE_STORAGE_KEY);

    return isMode(value) ? value : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

export function storeTheme(id: ThemeId, storage: StorageLike | null = getStorage()): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, id);
  } catch {
    return;
  }
}

export function storeMode(mode: Mode, storage: StorageLike | null = getStorage()): void {
  try {
    storage?.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    return;
  }
}

export function resolveAppearance(mode: Mode, prefersDark: boolean): Appearance {
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }

  return prefersDark ? 'dark' : 'light';
}

export function prefersDark(): boolean {
  try {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function applyTheme(id: ThemeId, root: ThemeRoot = document.documentElement): void {
  if (id === DEFAULT_THEME) {
    delete root.dataset.theme;

    return;
  }

  root.dataset.theme = id;
}

export function applyMode(
  mode: Mode,
  root: ModeRoot = document.documentElement,
  systemPrefersDark = prefersDark(),
): void {
  root.dataset.mode = mode;
  root.dataset.appearance = resolveAppearance(mode, systemPrefersDark);
}

export function nextMode(mode: Mode): Mode {
  return MODES[(MODES.indexOf(mode) + 1) % MODES.length];
}
