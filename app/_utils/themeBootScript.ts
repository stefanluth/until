import { DEFAULT_MODE, DEFAULT_THEME, MODES, MODE_STORAGE_KEY, THEMES, THEME_STORAGE_KEY } from './themes.ts';

type ThemeBootConfig = {
  themeKey: string;
  defaultTheme: string;
  themeIds: readonly string[];
  modeKey: string;
  modes: readonly string[];
  defaultMode: string;
};

const themeBootConfig: ThemeBootConfig = {
  themeKey: THEME_STORAGE_KEY,
  defaultTheme: DEFAULT_THEME,
  themeIds: THEMES.map((theme) => theme.id),
  modeKey: MODE_STORAGE_KEY,
  modes: MODES,
  defaultMode: DEFAULT_MODE,
};

// Serialized with toString() below; keep self-contained (no imports, nested functions, or helpers).
const applyStoredTheme = (config: ThemeBootConfig) => {
  try {
    const root = document.documentElement;

    const theme = localStorage.getItem(config.themeKey);
    // The default theme is represented by leaving the attribute unset.
    if (theme !== null && config.themeIds.includes(theme) && theme !== config.defaultTheme) {
      root.dataset.theme = theme;
    }

    const storedMode = localStorage.getItem(config.modeKey);
    const mode = storedMode !== null && config.modes.includes(storedMode) ? storedMode : config.defaultMode;
    root.dataset.mode = mode;

    root.dataset.appearance =
      mode === 'light' || mode === 'dark'
        ? mode
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
  } catch {
    // localStorage can throw when blocked; keep the server-rendered defaults.
  }
};

// Runs before first paint; official pattern: https://nextjs.org/docs/app/guides/preventing-flash-before-hydration
export const themeBootScript = `(${applyStoredTheme.toString()})(${JSON.stringify(themeBootConfig)});`;
