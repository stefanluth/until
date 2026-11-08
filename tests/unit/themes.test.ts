import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  MODES,
  MODE_STORAGE_KEY,
  THEMES,
  THEME_STORAGE_KEY,
  applyMode,
  applyTheme,
  isMode,
  isThemeId,
  nextMode,
  readStoredMode,
  readStoredTheme,
  resolveAppearance,
  storeMode,
  storeTheme,
} from '../../app/_utils/themes.ts';

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    values,
  };
}

function root() {
  return { dataset: {} as Record<string, string | undefined> };
}

describe('theme catalog', () => {
  it('exposes four unique themes with the default first', () => {
    assert.deepEqual(
      THEMES.map((theme) => theme.id),
      ['default', 'sunset', 'ocean', 'forest'],
    );
    assert.equal(new Set(THEMES.map((theme) => theme.id)).size, THEMES.length);
    assert.equal(DEFAULT_THEME, 'default');
  });

  it('exposes light, dark, and system modes with system as default', () => {
    assert.deepEqual(MODES, ['light', 'dark', 'system']);
    assert.equal(DEFAULT_MODE, 'system');
  });
});

describe('validation', () => {
  it('accepts only known theme ids', () => {
    assert.equal(isThemeId('sunset'), true);
    assert.equal(isThemeId('default'), true);
    assert.equal(isThemeId('midnight'), false);
    assert.equal(isThemeId(null), false);
    assert.equal(isThemeId(3), false);
  });

  it('accepts only known modes', () => {
    assert.equal(isMode('light'), true);
    assert.equal(isMode('system'), true);
    assert.equal(isMode('auto'), false);
    assert.equal(isMode(undefined), false);
  });
});

describe('stored preferences', () => {
  it('reads a stored theme and falls back to the default', () => {
    assert.equal(readStoredTheme(memoryStorage({ [THEME_STORAGE_KEY]: 'ocean' })), 'ocean');
    assert.equal(readStoredTheme(memoryStorage({ [THEME_STORAGE_KEY]: 'bogus' })), DEFAULT_THEME);
    assert.equal(readStoredTheme(memoryStorage()), DEFAULT_THEME);
    assert.equal(readStoredTheme(null), DEFAULT_THEME);
  });

  it('reads a stored mode and falls back to the default', () => {
    assert.equal(readStoredMode(memoryStorage({ [MODE_STORAGE_KEY]: 'dark' })), 'dark');
    assert.equal(readStoredMode(memoryStorage({ [MODE_STORAGE_KEY]: 'sepia' })), DEFAULT_MODE);
    assert.equal(readStoredMode(memoryStorage()), DEFAULT_MODE);
    assert.equal(readStoredMode(null), DEFAULT_MODE);
  });

  it('writes themes and modes', () => {
    const storage = memoryStorage();

    storeTheme('forest', storage);
    storeMode('light', storage);

    assert.equal(storage.values.get(THEME_STORAGE_KEY), 'forest');
    assert.equal(storage.values.get(MODE_STORAGE_KEY), 'light');
  });

  it('survives storage failures', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };

    assert.equal(readStoredTheme(broken), DEFAULT_THEME);
    assert.equal(readStoredMode(broken), DEFAULT_MODE);
    assert.doesNotThrow(() => storeTheme('sunset', broken));
    assert.doesNotThrow(() => storeMode('dark', broken));
  });
});

describe('appearance resolution', () => {
  it('honours explicit choices', () => {
    assert.equal(resolveAppearance('light', true), 'light');
    assert.equal(resolveAppearance('dark', false), 'dark');
  });

  it('follows the OS preference in system mode', () => {
    assert.equal(resolveAppearance('system', true), 'dark');
    assert.equal(resolveAppearance('system', false), 'light');
  });

  it('cycles light -> dark -> system -> light', () => {
    assert.equal(nextMode('light'), 'dark');
    assert.equal(nextMode('dark'), 'system');
    assert.equal(nextMode('system'), 'light');
  });
});

describe('DOM application', () => {
  it('sets and clears the theme attribute', () => {
    const element = root();

    applyTheme('sunset', element);
    assert.equal(element.dataset.theme, 'sunset');

    applyTheme('default', element);
    assert.equal('theme' in element.dataset, false);
  });

  it('records the mode and the resolved appearance', () => {
    const element = root();

    applyMode('dark', element, false);
    assert.equal(element.dataset.mode, 'dark');
    assert.equal(element.dataset.appearance, 'dark');

    applyMode('light', element, true);
    assert.equal(element.dataset.mode, 'light');
    assert.equal(element.dataset.appearance, 'light');

    applyMode('system', element, true);
    assert.equal(element.dataset.mode, 'system');
    assert.equal(element.dataset.appearance, 'dark');

    applyMode('system', element, false);
    assert.equal(element.dataset.appearance, 'light');
  });
});
