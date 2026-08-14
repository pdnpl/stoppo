import type { Mode } from './types';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface Records {
  reflex: number | null;
  count: number | null;
  /** Best per locked target, keyed by whole seconds: `{ "6": 143 }`. */
  lock: Record<string, number>;
}

export const STORAGE_KEY = 'stoppo:records:v1';

export function emptyRecords(): Records {
  return { reflex: null, count: null, lock: {} };
}

function positiveOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function sanitise(raw: unknown): Records {
  if (typeof raw !== 'object' || raw === null) return emptyRecords();
  const source = raw as Partial<Record<keyof Records, unknown>>;

  const lock: Record<string, number> = {};
  if (typeof source.lock === 'object' && source.lock !== null) {
    for (const [key, value] of Object.entries(source.lock)) {
      const score = positiveOrNull(value);
      if (score !== null && /^\d+$/.test(key)) lock[key] = score;
    }
  }

  return {
    reflex: positiveOrNull(source.reflex),
    count: positiveOrNull(source.count),
    lock,
  };
}

/**
 * Storage is best-effort: a blocked or full localStorage costs the player their
 * records, never their game.
 */
export function browserStorage(): StorageLike | null {
  try {
    const probe = globalThis.localStorage;
    probe.getItem(STORAGE_KEY);
    return probe;
  } catch {
    return null;
  }
}

export function loadRecords(storage: StorageLike | null): Records {
  if (storage === null) return emptyRecords();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw === null ? emptyRecords() : sanitise(JSON.parse(raw));
  } catch {
    return emptyRecords();
  }
}

export function saveRecords(
  storage: StorageLike | null,
  records: Records,
): void {
  if (storage === null) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* full or blocked — the round still counts on screen */
  }
}

function lockKey(targetMs: number): string {
  return Math.round(targetMs / 1000).toString();
}

export function bestFor(
  records: Records,
  mode: Mode,
  targetMs: number | null,
): number | null {
  switch (mode) {
    case 'reflex':
      return records.reflex;
    case 'count':
      return records.count;
    case 'lock':
      return targetMs === null
        ? null
        : (records.lock[lockKey(targetMs)] ?? null);
  }
}

/**
 * Lower is better in every mode, so a record is simply a smaller number than
 * whatever was there before.
 */
export function submitScore(
  records: Records,
  mode: Mode,
  targetMs: number | null,
  score: number,
): { records: Records; isRecord: boolean } {
  const previous = bestFor(records, mode, targetMs);
  const isRecord = previous === null || score < previous;
  if (!isRecord) return { records, isRecord: false };

  switch (mode) {
    case 'reflex':
      return { records: { ...records, reflex: score }, isRecord: true };
    case 'count':
      return { records: { ...records, count: score }, isRecord: true };
    case 'lock':
      if (targetMs === null) return { records, isRecord: false };
      return {
        records: {
          ...records,
          lock: { ...records.lock, [lockKey(targetMs)]: score },
        },
        isRecord: true,
      };
  }
}
