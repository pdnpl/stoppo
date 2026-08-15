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

/** Milliseconds as a whole number: `184`. */
export function formatMs(ms: number): string {
  return Math.round(ms).toString();
}

/** Seconds to millisecond precision: `3.184`. */
export function formatSeconds(ms: number): string {
  return (Math.round(ms) / 1000).toFixed(3);
}

/** Whole seconds for target labels: `6`. */
export function formatTargetSeconds(ms: number): string {
  return (Math.round(ms / 100) / 10).toFixed(ms % 1000 === 0 ? 0 : 1);
}
