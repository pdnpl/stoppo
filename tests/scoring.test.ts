import { describe, expect, it } from 'vitest';

import {
  formatMs,
  formatSeconds,
  formatTargetSeconds,
  gradeError,
  gradeOf,
  gradeReaction,
  qualityOf,
  scoreOf,
} from '../src/game/scoring';

describe('gradeReaction', () => {
  it('walks down the bands as the player gets slower', () => {
    expect(gradeReaction(120)).toBe('uncanny');
    expect(gradeReaction(180)).toBe('elite');
    expect(gradeReaction(220)).toBe('sharp');
    expect(gradeReaction(270)).toBe('solid');
    expect(gradeReaction(340)).toBe('steady');
    expect(gradeReaction(900)).toBe('slack');
  });

  it('puts a boundary value in the slower band', () => {
    expect(gradeReaction(150)).toBe('elite');
    expect(gradeReaction(149.9)).toBe('uncanny');
  });
});

describe('gradeError', () => {
  it('judges on distance from the target, in either direction', () => {
    expect(gradeError(40)).toBe('uncanny');
    expect(gradeError(-40)).toBe('uncanny');
    expect(gradeError(1_500)).toBe('slack');
  });
});

describe('scoreOf', () => {
  it('scores reaction and overshoot, both lower-is-better', () => {
    expect(scoreOf({ kind: 'reaction', reactionMs: 184 })).toBe(184);
    expect(
      scoreOf({
        kind: 'timed',
        targetMs: 3_000,
        elapsedMs: 3_184,
        errorMs: 184,
      }),
    ).toBe(184);
  });

  it('refuses to score a round that never measured anything', () => {
    expect(scoreOf({ kind: 'falseStart', earlyByMs: 200 })).toBeNull();
    expect(
      scoreOf({
        kind: 'tooEarly',
        targetMs: 3_000,
        elapsedMs: 2_800,
        shortByMs: 200,
      }),
    ).toBeNull();
    expect(scoreOf({ kind: 'abandoned' })).toBeNull();
    expect(gradeOf({ kind: 'abandoned' })).toBeNull();
  });
});

describe('qualityOf', () => {
  it('fills the meter for a reaction nobody beats and empties it at 500ms', () => {
    expect(qualityOf({ kind: 'reaction', reactionMs: 100 })).toBe(1);
    expect(qualityOf({ kind: 'reaction', reactionMs: 120 })).toBe(1);
    expect(qualityOf({ kind: 'reaction', reactionMs: 310 })).toBeCloseTo(
      0.5,
      5,
    );
    expect(qualityOf({ kind: 'reaction', reactionMs: 500 })).toBe(0);
    expect(qualityOf({ kind: 'reaction', reactionMs: 900 })).toBe(0);
  });

  it('fills the meter for a perfect count and empties it 1.5s out', () => {
    const timed = (errorMs: number) =>
      qualityOf({ kind: 'timed', targetMs: 3_000, elapsedMs: 0, errorMs });

    expect(timed(0)).toBe(1);
    expect(timed(750)).toBeCloseTo(0.5, 5);
    expect(timed(1_500)).toBe(0);
    expect(timed(4_000)).toBe(0);
  });

  it('reads nothing off a round that measured nothing', () => {
    expect(qualityOf({ kind: 'falseStart', earlyByMs: 200 })).toBeNull();
    expect(
      qualityOf({
        kind: 'tooEarly',
        targetMs: 3_000,
        elapsedMs: 2_800,
        shortByMs: 200,
      }),
    ).toBeNull();
    expect(qualityOf({ kind: 'abandoned' })).toBeNull();
  });
});

describe('formatting', () => {
  it('shows milliseconds whole', () => {
    expect(formatMs(183.6)).toBe('184');
    expect(formatMs(0.2)).toBe('0');
  });

  it('shows seconds to millisecond precision', () => {
    expect(formatSeconds(3_184)).toBe('3.184');
    expect(formatSeconds(3_000)).toBe('3.000');
  });

  it('shows targets without noise', () => {
    expect(formatTargetSeconds(6_000)).toBe('6');
    expect(formatTargetSeconds(2_000)).toBe('2');
  });
});
