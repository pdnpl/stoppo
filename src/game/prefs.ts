import { LOCALES } from '../i18n/copy';
import type { Locale } from '../i18n/copy';
import type { StorageLike } from './records';
import { clampTargetMs } from './rng';
import type { Mode } from './types';

export interface Prefs {
  mode: Mode;
  lockTargetMs: number;
  locale: Locale;
}

export const PREFS_KEY = 'stoppo:prefs:v1';

const MODES: readonly Mode[] = ['reflex', 'count', 'lock'];

export function defaultPrefs(locale: Locale = 'en'): Prefs {
  return { mode: 'reflex', lockTargetMs: 5_000, locale };
}

/**
 * `fallbackLocale` is what the browser suggested; a stored choice always wins,
 * because someone who switched language meant it.
 */
export function loadPrefs(
  storage: StorageLike | null,
  fallbackLocale: Locale = 'en',
): Prefs {
  if (storage === null) return defaultPrefs(fallbackLocale);
  try {
    const raw = storage.getItem(PREFS_KEY);
    if (raw === null) return defaultPrefs(fallbackLocale);
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return defaultPrefs(fallbackLocale);
    }

    const source = parsed as Partial<Record<keyof Prefs, unknown>>;
    const mode = MODES.find((candidate) => candidate === source.mode);
    const locale = LOCALES.find((candidate) => candidate === source.locale);

    return {
      mode: mode ?? 'reflex',
      lockTargetMs: clampTargetMs(
        typeof source.lockTargetMs === 'number' ? source.lockTargetMs : 5_000,
      ),
      locale: locale ?? fallbackLocale,
    };
  } catch {
    return defaultPrefs(fallbackLocale);
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
