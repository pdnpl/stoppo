import { formatMs, formatSeconds, gradeOf, qualityOf } from '../game/scoring';
import type { Outcome } from '../game/types';
import type { Copy } from '../i18n/copy';

export interface VerdictView {
  /** Grade or failure headline. */
  label: string;
  /** The big numeral, or a dash when there is nothing honest to show. */
  number: string;
  unit: string;
  detail: string;
  fail: boolean;
  /** 0–1 for the quality meter, `null` when the round measured nothing. */
  quality: number | null;
  /** Sentence for the live region. */
  announce: string;
}

export function verdictView(outcome: Outcome, copy: Copy): VerdictView {
  const grade = gradeOf(outcome);
  const headline = grade === null ? '' : copy.grades[grade];
  const quality = qualityOf(outcome);

  switch (outcome.kind) {
    case 'reaction': {
      const ms = formatMs(outcome.reactionMs);
      return {
        label: headline,
        number: ms,
        unit: copy.unitMs,
        detail: '',
        fail: false,
        quality,
        announce: copy.announceReaction(ms, headline),
      };
    }
    case 'timed': {
      const ms = formatMs(outcome.errorMs);
      return {
        label: headline,
        number: ms,
        unit: copy.unitLate,
        detail: copy.againstTarget(
          formatSeconds(outcome.targetMs),
          formatSeconds(outcome.elapsedMs),
        ),
        fail: false,
        quality,
        announce: copy.announceLate(ms, headline),
      };
    }
    case 'falseStart':
      return {
        label: copy.falseStart,
        number: copy.noNumber,
        unit: '',
        detail: copy.falseStartDetail,
        fail: true,
        quality: null,
        announce: copy.announceFalseStart,
      };
    case 'tooEarly': {
      const ms = formatMs(outcome.shortByMs);
      return {
        label: copy.tooEarly,
        number: ms,
        unit: copy.unitShort,
        detail: copy.againstTarget(
          formatSeconds(outcome.targetMs),
          formatSeconds(outcome.elapsedMs),
        ),
        fail: true,
        quality: null,
        announce: copy.announceTooEarly(ms),
      };
    }
    case 'abandoned':
      return {
        label: copy.dropped,
        number: copy.noNumber,
        unit: '',
        detail: copy.droppedDetail,
        fail: true,
        quality: null,
        announce: copy.announceDropped,
      };
  }
}
