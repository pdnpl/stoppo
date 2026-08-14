import { describe, expect, it } from 'vitest';

import { verdictView } from '../src/ui/verdict';

describe('verdictView', () => {
  it('leads with the grade on a clean reaction', () => {
    const view = verdictView({ kind: 'reaction', reactionMs: 184 });

    expect(view).toMatchObject({
      label: 'Elite',
      number: '184',
      unit: 'ms',
      fail: false,
    });
  });

  it('says how late a counted round landed, and against what', () => {
    const view = verdictView({
      kind: 'timed',
      targetMs: 3_000,
      elapsedMs: 3_184,
      errorMs: 184,
    });

    expect(view.number).toBe('184');
    expect(view.unit).toBe('ms late');
    expect(view.detail).toBe('target 3.000s · you 3.184s');
    expect(view.fail).toBe(false);
  });

  it('shows no number for a false start, because there is none', () => {
    const view = verdictView({ kind: 'falseStart', earlyByMs: 400 });

    expect(view.label).toBe('False start');
    expect(view.number).toBe('—');
    expect(view.fail).toBe(true);
  });

  it('tells an early presser exactly how short they were', () => {
    const view = verdictView({
      kind: 'tooEarly',
      targetMs: 3_000,
      elapsedMs: 2_800,
      shortByMs: 200,
    });

    expect(view.label).toBe('Too early');
    expect(view.number).toBe('200');
    expect(view.unit).toBe('ms short');
    expect(view.fail).toBe(true);
  });

  it('has something to announce for every outcome', () => {
    const outcomes = [
      { kind: 'reaction', reactionMs: 184 },
      { kind: 'timed', targetMs: 3_000, elapsedMs: 3_100, errorMs: 100 },
      { kind: 'falseStart', earlyByMs: 0 },
      { kind: 'tooEarly', targetMs: 3_000, elapsedMs: 2_900, shortByMs: 100 },
      { kind: 'abandoned' },
    ] as const;

    for (const outcome of outcomes) {
      expect(verdictView(outcome).announce.length).toBeGreaterThan(0);
    }
  });
});
