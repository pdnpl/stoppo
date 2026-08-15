import type { Outcome } from './types';

export type Grade =
  'uncanny' | 'elite' | 'sharp' | 'solid' | 'steady' | 'slack';

function band(value: number, thresholds: readonly number[]): Grade {
  const grades: readonly Grade[] = [
    'uncanny',
    'elite',
    'sharp',
    'solid',
    'steady',
  ];
  for (let i = 0; i < thresholds.length; i += 1) {
    if (value < thresholds[i]!) return grades[i]!;
  }
  return 'slack';
}

/** Simple visual reaction time. Trained players land around 180ms. */
export function gradeReaction(reactionMs: number): Grade {
  return band(reactionMs, [150, 190, 230, 280, 350]);
}

/** Absolute error against the counted interval. */
export function gradeError(errorMs: number): Grade {
  return band(Math.abs(errorMs), [60, 150, 300, 600, 1200]);
}

/**
 * The single number a round is judged by, lower being better: milliseconds of
 * reaction in REFLEX, milliseconds of overshoot in the counting modes. Rounds
 * that never produced a clean measurement score nothing.
 */
export function scoreOf(outcome: Outcome): number | null {
  switch (outcome.kind) {
    case 'reaction':
      return outcome.reactionMs;
    case 'timed':
      return outcome.errorMs;
    case 'falseStart':
    case 'tooEarly':
    case 'abandoned':
      return null;
  }
}

export function gradeOf(outcome: Outcome): Grade | null {
  switch (outcome.kind) {
    case 'reaction':
      return gradeReaction(outcome.reactionMs);
    case 'timed':
      return gradeError(outcome.errorMs);
    case 'falseStart':
    case 'tooEarly':
    case 'abandoned':
      return null;
  }
}

/**
 * Seconds to millisecond precision: `0.214`, `3.184`. Every measured value on
 * screen goes through here — "ms" is jargon, and the same number said in
 * seconds costs nothing to read.
 *
 * The separator is the caller's, because Polish writes `0,214` and English
 * writes `0.214`, and a game that gets that wrong looks untranslated.
 */
export function formatSeconds(ms: number, decimal = '.'): string {
  const text = (Math.round(ms) / 1000).toFixed(3);
  return decimal === '.' ? text : text.replace('.', decimal);
}

/** Whole seconds for target labels: `6`. */
export function formatTargetSeconds(ms: number): string {
  return (Math.round(ms / 100) / 10).toFixed(ms % 1000 === 0 ? 0 : 1);
}
