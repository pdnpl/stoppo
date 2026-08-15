import { describe, expect, it } from 'vitest';

import { COPY, LOCALES, detectLocale } from '../src/i18n/copy';

/** Reduces a dictionary to its shape, so two locales can be compared. */
function shape(value: unknown): unknown {
  if (typeof value === 'function') return 'fn';
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, shape(nested)]),
    );
  }
  return typeof value;
}

function everyString(value: unknown, path: string, found: string[]): void {
  if (typeof value === 'string') {
    found.push(`${path}:${value}`);
    return;
  }
  if (typeof value === 'object' && value !== null) {
    for (const [key, nested] of Object.entries(value)) {
      everyString(nested, `${path}.${key}`, found);
    }
  }
}

describe('copy', () => {
  it('has the same shape in every locale', () => {
    const reference = shape(COPY.en);
    for (const locale of LOCALES) {
      expect(shape(COPY[locale]), locale).toEqual(reference);
    }
  });

  it('leaves nothing blank', () => {
    for (const locale of LOCALES) {
      const found: string[] = [];
      everyString(COPY[locale], locale, found);
      expect(found.length).toBeGreaterThan(20);
      for (const entry of found) {
        expect(entry.split(':').slice(1).join(':').trim(), entry).not.toBe('');
      }
    }
  });

  it('threads values through the sentences that take them', () => {
    for (const locale of LOCALES) {
      const copy = COPY[locale];
      expect(copy.seconds('3')).toContain('3');
      expect(copy.againstTarget('3.000', '3.184')).toContain('3.184');
      expect(copy.bestReflex('184')).toContain('184');
      expect(copy.bestOff('184')).toContain('184');
      expect(copy.newRecordBy('16')).toContain('16');
      expect(copy.offBest('28', '186')).toContain('28');
      expect(copy.offBest('28', '186')).toContain('186');
      expect(copy.ringLabel('214', '186')).toContain('186');
      expect(copy.announceReaction('184', 'Elite')).toContain('184');
      expect(copy.announceLate('184', 'Elite')).toContain('Elite');
      expect(copy.announceTooEarly('200')).toContain('200');
    }
  });

  it('keeps the second symbol tight against its number', () => {
    // A digit, whitespace, then a lone `s`. `seconds` and `sekundy` are words
    // rather than the symbol, so the word boundary leaves them alone.
    const loose = /\d\s+s\b/;

    for (const locale of LOCALES) {
      const copy = COPY[locale];
      const rendered = [
        copy.seconds('4'),
        copy.againstTarget('3.000', '3.142'),
        copy.newRecordBy('0.016'),
        copy.offBest('0.028', '0.186'),
        copy.bestReflex('0.214'),
        copy.bestOff('0.310'),
        copy.modes.count.desc,
      ];

      for (const text of rendered) {
        expect(text, `${locale}: ${text}`).not.toMatch(loose);
      }
    }
  });

  it('tells the counting player what to do, not what is happening', () => {
    // The waiting screen says "wait"; the counting screen has to say "tap",
    // or an empty dark screen reads as a game that has stopped working.
    for (const locale of LOCALES) {
      const copy = COPY[locale];
      expect(copy.countPrompt).not.toBe(copy.wait);
      expect(copy.countPrompt.length).toBeGreaterThan(3);
    }

    expect(COPY.pl.countPrompt).toBe('Kliknij za');
    expect(COPY.en.countPrompt).toBe('Tap in');
  });

  it('translates the mode names rather than leaving them English', () => {
    expect(COPY.pl.modes.reflex.name).not.toBe(COPY.en.modes.reflex.name);
    expect(COPY.pl.grades.elite).not.toBe(COPY.en.grades.elite);
  });
});

describe('detectLocale', () => {
  it('picks Polish for a Polish browser', () => {
    expect(detectLocale(['pl-PL', 'en-US'])).toBe('pl');
    expect(detectLocale(['PL'])).toBe('pl');
  });

  it('falls back to English for everyone else', () => {
    expect(detectLocale(['en-GB', 'de'])).toBe('en');
    expect(detectLocale([])).toBe('en');
  });
});
