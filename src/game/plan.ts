import { clampTargetMs, randomDelayMs, randomTargetMs } from './rng';
import type { RandomSource } from './rng';
import type { Mode, RoundPlan } from './types';

/**
 * Builds the round. The mode is the player's contract and is never randomised;
 * only the stimulus inside the round is — the dark wait in every mode, plus the
 * interval in COUNT.
 */
export function planRound(
  mode: Mode,
  rand: RandomSource,
  lockTargetMs: number,
): RoundPlan {
  const delayMs = randomDelayMs(rand);

  switch (mode) {
    case 'reflex':
      return { mode, delayMs, targetMs: null };
    case 'count':
      return { mode, delayMs, targetMs: randomTargetMs(rand) };
    case 'lock':
      return { mode, delayMs, targetMs: clampTargetMs(lockTargetMs) };
  }
}
