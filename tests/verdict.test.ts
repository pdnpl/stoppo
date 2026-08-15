import { describe, expect, it } from 'vitest';

import { COPY } from '../src/i18n/copy';
import {
  DISC_MAX_RATIO,
  DISC_MIN_RATIO,
  recordView,
  verdictView,
} from '../src/ui/verdict';

const en = COPY.en;
const pl = COPY.pl;

describe('verdictView', () => {
  it('leads with the grade on a clean reaction', () => {
    const view = verdictView({ kind: 'reaction', reactionMs: 184 }, en);

    expect(view).toMatchObject({
      label: 'Elite',
      number: '0.184',
      unit: 'seconds',
      fail: false,
    });
  });

  it('says the same reaction with a comma in Polish', () => {
    const view = verdictView({ kind: 'reaction', reactionMs: 184 }, pl);

    expect(view.number).toBe('0,184');
    expect(view.unit).toBe('sekundy');
  });

  it('says how late a counted round landed, and against what', () => {
    const view = verdictView(
      { kind: 'timed', targetMs: 3_000, elapsedMs: 3_184, errorMs: 184 },
      en,
    );

    expect(view.number).toBe('0.184');
    expect(view.unit).toBe('seconds late');
    expect(view.detail).toBe('target 3.000s · you 3.184s');
    expect(view.fail).toBe(false);
  });

  it('gives a burnt round no number, so the headline carries it alone', () => {
    const view = verdictView({ kind: 'falseStart', earlyByMs: 400 }, en);

    expect(view.label).toBe('False start');
    expect(view.number).toBe('');
    expect(view.detail).toBe('You went before the light.');
    expect(view.fail).toBe(true);
  });

  it('still tells an early presser how short they were', () => {
    const view = verdictView(
      { kind: 'tooEarly', targetMs: 3_000, elapsedMs: 2_800, shortByMs: 200 },
      en,
    );

    expect(view.label).toBe('Too early');
    expect(view.number).toBe('');
    expect(view.detail).toContain('0.200 seconds early');
    expect(view.detail).toContain('target 3.000s');
  });

  it('leaves no millisecond abbreviation anywhere a player can read it', () => {
    const outcomes = [
      { kind: 'reaction', reactionMs: 184 },
      { kind: 'timed', targetMs: 3_000, elapsedMs: 3_184, errorMs: 184 },
      { kind: 'falseStart', earlyByMs: 400 },
      { kind: 'tooEarly', targetMs: 3_000, elapsedMs: 2_800, shortByMs: 200 },
      { kind: 'abandoned' },
    ] as const;

    for (const copy of [en, pl]) {
      for (const outcome of outcomes) {
        const view = verdictView(outcome, copy);
        for (const text of [view.unit, view.detail, view.announce]) {
          expect(text, `${outcome.kind}: ${text}`).not.toMatch(/\bms\b/);
        }
      }
    }
  });

  it('speaks Polish when handed the Polish copy', () => {
    expect(verdictView({ kind: 'falseStart', earlyByMs: 0 }, pl).label).toBe(
      'Falstart',
    );
    expect(verdictView({ kind: 'reaction', reactionMs: 184 }, pl).label).toBe(
      'Elita',
    );
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

describe('recordView', () => {
  it('draws no ring at all when there is no record to chase yet', () => {
    const view = recordView(214, null, en);

    expect(view.ratio).toBeNull();
    expect(view.beats).toBe(false);
    expect(view.line).toBe('your first round in this mode');
  });

  it('puts the disc inside the ring when the record falls', () => {
    const view = recordView(170, 186, en);

    expect(view.beats).toBe(true);
    expect(view.ratio).toBeLessThan(1);
    expect(view.line).toBe('new record — 0.016 s better');
  });

  it('pushes the disc outside the ring when the round was worse', () => {
    const view = recordView(214, 186, en);

    expect(view.beats).toBe(false);
    expect(view.ratio).toBeGreaterThan(1);
    expect(view.line).toBe('0.028 s off your best of 0.186 s');
  });

  it('calls a tie a tie rather than a record', () => {
    const view = recordView(186, 186, en);

    expect(view.beats).toBe(false);
    expect(view.ratio).toBe(1);
    expect(view.line).toBe('exactly your record');
  });

  it('keeps a wild round on screen, and the number inside the disc', () => {
    expect(recordView(4_000, 186, en).ratio).toBe(DISC_MAX_RATIO);
    expect(recordView(2, 186, en).ratio).toBe(DISC_MIN_RATIO);
  });

  it('treats a nonsense record as no record', () => {
    expect(recordView(214, 0, en).ratio).toBeNull();
  });

  it('describes the picture for anyone who cannot see it', () => {
    const view = recordView(214, 186, pl);

    expect(view.label).toContain('0,214');
    expect(view.label).toContain('0,186');
    expect(view.line).toBe('o 0,028 s gorzej od rekordu 0,186 s');
  });

  it('counts in seconds in every line, in both languages', () => {
    const lines = [
      recordView(170, 186, en).line,
      recordView(214, 186, en).line,
      recordView(170, 186, pl).line,
      recordView(214, 186, pl).line,
      recordView(214, null, pl).line,
    ];

    for (const line of lines) {
      expect(line, line).not.toMatch(/\bms\b/);
    }
  });
});
