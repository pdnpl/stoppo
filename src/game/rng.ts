import {
  MAX_DELAY_MS,
  MAX_TARGET_MS,
  MIN_DELAY_MS,
  MIN_TARGET_MS,
  TARGET_STEP_MS,
} from './constants';

/** Returns a float in `[0, 1)`. Injectable so tests can be deterministic. */
export type RandomSource = () => number;

/**
 * `Math.random` is seeded per-context and, on some engines, predictable enough
 * that a determined player could line up the flash. The delay is the only thing
 * standing between the player and a guess, so it gets real entropy.
 */
export const cryptoRandom: RandomSource = () => {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0]! / 2 ** 32;
};

function unitInterval(rand: RandomSource): number {
  const value = rand();
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 0.999_999_999);
}

/** Uniform dark wait before the flash, in milliseconds. */
export function randomDelayMs(rand: RandomSource): number {
  const span = MAX_DELAY_MS - MIN_DELAY_MS;
  return Math.round(MIN_DELAY_MS + unitInterval(rand) * span);
}

/** Uniform whole-second interval for COUNT rounds, in milliseconds. */
export function randomTargetMs(rand: RandomSource): number {
  const steps = (MAX_TARGET_MS - MIN_TARGET_MS) / TARGET_STEP_MS + 1;
  const index = Math.floor(unitInterval(rand) * steps);
  return MIN_TARGET_MS + index * TARGET_STEP_MS;
}

/** Snaps an arbitrary target onto the whole-second grid the game supports. */
export function clampTargetMs(targetMs: number): number {
  if (!Number.isFinite(targetMs)) return MIN_TARGET_MS;
  const snapped = Math.round(targetMs / TARGET_STEP_MS) * TARGET_STEP_MS;
  return Math.min(Math.max(snapped, MIN_TARGET_MS), MAX_TARGET_MS);
}
