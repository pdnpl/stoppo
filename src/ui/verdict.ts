import { formatSeconds, gradeOf } from '../game/scoring';
import type { Outcome } from '../game/types';
import type { Copy } from '../i18n/copy';

export interface VerdictView {
  /** Grade or failure headline. */
  label: string;
  /** The number inside the disc. Empty when the round measured nothing. */
  number: string;
  unit: string;
  detail: string;
  fail: boolean;
  /** Sentence for the live region. */
  announce: string;
}

export function verdictView(outcome: Outcome, copy: Copy): VerdictView {
  const grade = gradeOf(outcome);
  const headline = grade === null ? '' : copy.grades[grade];

  switch (outcome.kind) {
    case 'reaction': {
      const value = formatSeconds(outcome.reactionMs, copy.decimal);
      return {
        label: headline,
        number: value,
        unit: copy.unitSeconds,
        detail: '',
        fail: false,
        announce: copy.announceReaction(value, headline),
      };
    }
    case 'timed': {
      const value = formatSeconds(outcome.errorMs, copy.decimal);
      return {
        label: headline,
        number: value,
        unit: copy.unitLate,
        detail: copy.againstTarget(
          formatSeconds(outcome.targetMs, copy.decimal),
          formatSeconds(outcome.elapsedMs, copy.decimal),
        ),
        fail: false,
        announce: copy.announceLate(value, headline),
      };
    }
    case 'falseStart':
      return {
        label: copy.falseStart,
        number: '',
        unit: '',
        detail: copy.falseStartDetail,
        fail: true,
        announce: copy.announceFalseStart,
      };
    case 'tooEarly': {
      const value = formatSeconds(outcome.shortByMs, copy.decimal);
      return {
        label: copy.tooEarly,
        number: '',
        unit: '',
        detail: `${value} ${copy.unitShort} · ${copy.againstTarget(
          formatSeconds(outcome.targetMs, copy.decimal),
          formatSeconds(outcome.elapsedMs, copy.decimal),
        )}`,
        fail: true,
        announce: copy.announceTooEarly(value),
      };
    }
    case 'abandoned':
      return {
        label: copy.dropped,
        number: '',
        unit: '',
        detail: copy.droppedDetail,
        fail: true,
        announce: copy.announceDropped,
      };
  }
}

/**
 * The disc can shrink to this share of the record ring, and grow to that one.
 * Clamped at both ends: a wild round still has to fit on screen, and the number
 * printed inside still has to fit in the disc.
 */
export const DISC_MIN_RATIO = 0.7;
export const DISC_MAX_RATIO = 1.5;

export interface RecordView {
  /** Disc radius as a multiple of the ring, or `null` when there is no ring. */
  ratio: number | null;
  /** One line saying which side of the record this round landed on. */
  line: string;
  beats: boolean;
  /** Description of the whole picture, for assistive technology. */
  label: string;
}

/**
 * Compares a round against the record it was chasing — the record as it stood
 * *before* this round, otherwise a new best would forever be compared to
 * itself and every record would read as a tie.
 */
export function recordView(
  score: number,
  previousBest: number | null,
  copy: Copy,
): RecordView {
  if (previousBest === null || previousBest <= 0) {
    return {
      ratio: null,
      line: copy.firstRound,
      beats: false,
      label: copy.firstRound,
    };
  }

  const ratio = Math.min(
    Math.max(score / previousBest, DISC_MIN_RATIO),
    DISC_MAX_RATIO,
  );
  const delta = formatSeconds(Math.abs(score - previousBest), copy.decimal);
  const best = formatSeconds(previousBest, copy.decimal);
  const label = copy.ringLabel(formatSeconds(score, copy.decimal), best);

  if (score < previousBest) {
    return { ratio, line: copy.newRecordBy(delta), beats: true, label };
  }
  if (score === previousBest) {
    return { ratio, line: copy.sameAsRecord, beats: false, label };
  }
  return { ratio, line: copy.offBest(delta, best), beats: false, label };
}
