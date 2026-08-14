import { describe, expect, it } from 'vitest';

import {
  PREFS_KEY,
  defaultPrefs,
  loadPrefs,
  savePrefs,
} from '../src/game/prefs';
import type { StorageLike } from '../src/game/records';

function fakeStorage(seed: Record<string, string> = {}): StorageLike {
  const data = { ...seed };
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe('prefs', () => {
  it('opens on reflex with a mid-range interval', () => {
    expect(loadPrefs(fakeStorage())).toEqual(defaultPrefs());
    expect(loadPrefs(null)).toEqual(defaultPrefs());
  });

  it('takes the language from the browser when nothing is stored', () => {
    expect(loadPrefs(fakeStorage(), 'pl').locale).toBe('pl');
    expect(loadPrefs(null, 'pl').locale).toBe('pl');
  });

  it('remembers mode, interval and language between visits', () => {
    const storage = fakeStorage();
    savePrefs(storage, { mode: 'lock', lockTargetMs: 8_000, locale: 'pl' });

    expect(loadPrefs(storage, 'en')).toEqual({
      mode: 'lock',
      lockTargetMs: 8_000,
      locale: 'pl',
    });
  });

  it('lets a stored language beat the browser, because it was chosen', () => {
    const storage = fakeStorage();
    savePrefs(storage, { mode: 'reflex', lockTargetMs: 5_000, locale: 'en' });

    expect(loadPrefs(storage, 'pl').locale).toBe('en');
  });

  it('falls back rather than trusting a tampered payload', () => {
    const junk = JSON.stringify({
      mode: 'turbo',
      lockTargetMs: 99_000,
      locale: 'kl',
    });

    expect(loadPrefs(fakeStorage({ [PREFS_KEY]: junk }), 'pl')).toEqual({
      mode: 'reflex',
      lockTargetMs: 10_000,
      locale: 'pl',
    });
    expect(loadPrefs(fakeStorage({ [PREFS_KEY]: '{' }))).toEqual(
      defaultPrefs(),
    );
  });
});
