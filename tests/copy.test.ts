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
      expect(copy.waitThenCount('3')).toContain('3');
      expect(copy.countingNow('7')).toContain('7');
      expect(copy.againstTarget('3.000', '3.184')).toContain('3.184');
      expect(copy.best('184 ms')).toContain('184');
      expect(copy.bestReflex('184')).toContain('184');
      expect(copy.bestOff('184')).toContain('184');
      expect(copy.announceReaction('184', 'Elite')).toContain('184');
      expect(copy.announceLate('184', 'Elite')).toContain('Elite');
      expect(copy.announceTooEarly('200')).toContain('200');
    }
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
