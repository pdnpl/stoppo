import { GRADE_LABEL, formatMs, formatSeconds, gradeOf } from '../game/scoring';
import type { Outcome } from '../game/types';

export interface VerdictView {
  /** Grade or failure headline. */
  label: string;
  /** The big numeral, or an em dash when there is nothing honest to show. */
  number: string;
  unit: string;
  detail: string;
  fail: boolean;
  /** Sentence for the live region. */
  announce: string;
}

function interval(targetMs: number, elapsedMs: number): string {
  return `target ${formatSeconds(targetMs)}s · you ${formatSeconds(elapsedMs)}s`;
}

export function verdictView(outcome: Outcome): VerdictView {
  const grade = gradeOf(outcome);
  const headline = grade === null ? '' : GRADE_LABEL[grade];

  switch (outcome.kind) {
    case 'reaction': {
      const ms = formatMs(outcome.reactionMs);
      return {
        label: headline,
        number: ms,
        unit: 'ms',
        detail: '',
        fail: false,
        announce: `${ms} milliseconds. ${headline}.`,
      };
    }
    case 'timed': {
      const ms = formatMs(outcome.errorMs);
      return {
        label: headline,
        number: ms,
        unit: 'ms late',
        detail: interval(outcome.targetMs, outcome.elapsedMs),
        fail: false,
        announce: `${ms} milliseconds late. ${headline}.`,
      };
    }
    case 'falseStart':
      return {
        label: 'False start',
        number: '—',
        unit: '',
        detail: 'You went before the light.',
        fail: true,
        announce: 'False start. You went before the light.',
      };
    case 'tooEarly': {
      const ms = formatMs(outcome.shortByMs);
      return {
        label: 'Too early',
        number: ms,
        unit: 'ms short',
        detail: interval(outcome.targetMs, outcome.elapsedMs),
        fail: true,
        announce: `Too early by ${ms} milliseconds.`,
      };
    }
    case 'abandoned':
      return {
        label: 'Dropped',
        number: '—',
        unit: '',
        detail: 'No press came. Round dropped.',
        fail: true,
        announce: 'Round dropped. No press came.',
      };
  }
}
