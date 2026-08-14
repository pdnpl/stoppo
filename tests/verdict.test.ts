import { describe, expect, it } from 'vitest';

import { COPY } from '../src/i18n/copy';
import { verdictView } from '../src/ui/verdict';

const en = COPY.en;
const pl = COPY.pl;

describe('verdictView', () => {
  it('leads with the grade on a clean reaction', () => {
    const view = verdictView({ kind: 'reaction', reactionMs: 184 }, en);

    expect(view).toMatchObject({
      label: 'Elite',
      number: '184',
      unit: 'ms',
      fail: false,
    });
  });

  it('says how late a counted round landed, and against what', () => {
    const view = verdictView(
      { kind: 'timed', targetMs: 3_000, elapsedMs: 3_184, errorMs: 184 },
      en,
    );

    expect(view.number).toBe('184');
    expect(view.unit).toBe('ms late');
    expect(view.detail).toBe('target 3.000s · you 3.184s');
    expect(view.fail).toBe(false);
  });

  it('shows no number for a false start, because there is none', () => {
    const view = verdictView({ kind: 'falseStart', earlyByMs: 400 }, en);

    expect(view.label).toBe('False start');
    expect(view.number).toBe('—');
    expect(view.fail).toBe(true);
  });

  it('tells an early presser exactly how short they were', () => {
    const view = verdictView(
      {
        kind: 'tooEarly',
        targetMs: 3_000,
        elapsedMs: 2_800,
        shortByMs: 200,
      },
      en,
    );

    expect(view.label).toBe('Too early');
    expect(view.number).toBe('200');
    expect(view.unit).toBe('ms early');
    expect(view.fail).toBe(true);
  });

  it('speaks Polish when handed the Polish copy', () => {
    const view = verdictView({ kind: 'falseStart', earlyByMs: 0 }, pl);

    expect(view.label).toBe('Falstart');
    expect(view.detail).toBe('Kliknięcie przed błyskiem.');
    expect(verdictView({ kind: 'reaction', reactionMs: 184 }, pl).label).toBe(
      'Elita',
    );
  });

  it('offers a meter reading only where something was measured', () => {
    expect(verdictView({ kind: 'reaction', reactionMs: 120 }, en).quality).toBe(
      1,
    );
    expect(verdictView({ kind: 'reaction', reactionMs: 500 }, en).quality).toBe(
      0,
    );
    expect(verdictView({ kind: 'falseStart', earlyByMs: 0 }, en).quality).toBe(
      null,
    );
    expect(verdictView({ kind: 'abandoned' }, en).quality).toBe(null);
  });

  it('has something to announce for every outcome, in both languages', () => {
    const outcomes = [
      { kind: 'reaction', reactionMs: 184 },
      { kind: 'timed', targetMs: 3_000, elapsedMs: 3_100, errorMs: 100 },
      { kind: 'falseStart', earlyByMs: 0 },
      { kind: 'tooEarly', targetMs: 3_000, elapsedMs: 2_900, shortByMs: 100 },
      { kind: 'abandoned' },
    ] as const;

    for (const outcome of outcomes) {
      expect(verdictView(outcome, en).announce.length).toBeGreaterThan(0);
      expect(verdictView(outcome, pl).announce.length).toBeGreaterThan(0);
    }
  });
});
