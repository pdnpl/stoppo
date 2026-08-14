import { clampTargetMs } from './rng';
import type { StorageLike } from './records';
import type { Mode } from './types';

export interface Prefs {
  mode: Mode;
  lockTargetMs: number;
}

export const PREFS_KEY = 'stoppo:prefs:v1';

const MODES: readonly Mode[] = ['reflex', 'count', 'lock'];

export function defaultPrefs(): Prefs {
  return { mode: 'reflex', lockTargetMs: 5_000 };
}

export function loadPrefs(storage: StorageLike | null): Prefs {
  if (storage === null) return defaultPrefs();
  try {
    const raw = storage.getItem(PREFS_KEY);
    if (raw === null) return defaultPrefs();
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return defaultPrefs();

    const source = parsed as Partial<Record<keyof Prefs, unknown>>;
    const mode = MODES.find((candidate) => candidate === source.mode);
    return {
      mode: mode ?? 'reflex',
      lockTargetMs: clampTargetMs(
        typeof source.lockTargetMs === 'number' ? source.lockTargetMs : 5_000,
      ),
    };
  } catch {
    return defaultPrefs();
  }
}

export function savePrefs(storage: StorageLike | null, prefs: Prefs): void {
  if (storage === null) return;
  try {
    storage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* nothing here is worth interrupting a round for */
  }
}
