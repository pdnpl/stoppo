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

  it('remembers the mode and interval between visits', () => {
    const storage = fakeStorage();
    savePrefs(storage, { mode: 'lock', lockTargetMs: 8_000 });

    expect(loadPrefs(storage)).toEqual({ mode: 'lock', lockTargetMs: 8_000 });
  });

  it('falls back rather than trusting a tampered payload', () => {
    const junk = JSON.stringify({ mode: 'turbo', lockTargetMs: 99_000 });

    expect(loadPrefs(fakeStorage({ [PREFS_KEY]: junk }))).toEqual({
      mode: 'reflex',
      lockTargetMs: 10_000,
    });
    expect(loadPrefs(fakeStorage({ [PREFS_KEY]: '{' }))).toEqual(
      defaultPrefs(),
    );
  });
});
