import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';

import { themeBootScript } from '../../app/_utils/themeBootScript.ts';
import { DEFAULT_MODE, DEFAULT_THEME, MODE_STORAGE_KEY, THEME_STORAGE_KEY } from '../../app/_utils/themes.ts';

function run(stored: Record<string, string> = {}, prefersDark = false, blockStorage = false) {
  const dataset: Record<string, string | undefined> = {};

  runInNewContext(themeBootScript, {
    document: { documentElement: { dataset } },
    localStorage: {
      getItem: (key: string) => {
        if (blockStorage) throw new Error('blocked');

        return stored[key] ?? null;
      },
    },
    window: { matchMedia: () => ({ matches: prefersDark }) },
  });

  return dataset;
}

describe('theme boot script', () => {
  it('applies a stored theme and explicit mode', () => {
    assert.deepEqual(run({ [THEME_STORAGE_KEY]: 'ocean', [MODE_STORAGE_KEY]: 'dark' }), {
      theme: 'ocean',
      mode: 'dark',
      appearance: 'dark',
    });
  });

  it('leaves the default theme unset and resolves system appearance', () => {
    assert.deepEqual(run({ [THEME_STORAGE_KEY]: DEFAULT_THEME, [MODE_STORAGE_KEY]: 'system' }, true), {
      mode: 'system',
      appearance: 'dark',
    });
  });

  it('falls back to defaults for unknown stored values', () => {
    assert.deepEqual(run({ [THEME_STORAGE_KEY]: 'bogus', [MODE_STORAGE_KEY]: 'bogus' }), {
      mode: DEFAULT_MODE,
      appearance: 'light',
    });
  });

  it('keeps the server-rendered defaults when storage is blocked', () => {
    assert.deepEqual(run({}, false, true), {});
  });
});
