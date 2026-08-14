import { describe, expect, it } from 'vitest';

import {
  MAX_DELAY_MS,
  MAX_TARGET_MS,
  MIN_DELAY_MS,
  MIN_TARGET_MS,
} from '../src/game/constants';
import { clampTargetMs, randomDelayMs, randomTargetMs } from '../src/game/rng';
import { planRound } from '../src/game/plan';

const constant = (value: number) => () => value;

describe('randomDelayMs', () => {
  it('spans exactly the advertised window', () => {
    expect(randomDelayMs(constant(0))).toBe(MIN_DELAY_MS);
    expect(randomDelayMs(constant(0.5))).toBe(3_000);
    expect(randomDelayMs(constant(0.999_999_999))).toBe(MAX_DELAY_MS);
  });

  it('survives a source that misbehaves', () => {
    for (const value of [-1, 1, 2, Number.NaN, Number.POSITIVE_INFINITY]) {
      const delay = randomDelayMs(constant(value));
      expect(delay).toBeGreaterThanOrEqual(MIN_DELAY_MS);
      expect(delay).toBeLessThanOrEqual(MAX_DELAY_MS);
    }
  });
});

describe('randomTargetMs', () => {
  it('only ever lands on whole seconds inside the range', () => {
    for (let i = 0; i < 200; i += 1) {
      const target = randomTargetMs(constant(i / 200));
      expect(target % 1_000).toBe(0);
      expect(target).toBeGreaterThanOrEqual(MIN_TARGET_MS);
      expect(target).toBeLessThanOrEqual(MAX_TARGET_MS);
    }
  });

  it('reaches both ends of the range', () => {
    expect(randomTargetMs(constant(0))).toBe(MIN_TARGET_MS);
    expect(randomTargetMs(constant(0.999_999_999))).toBe(MAX_TARGET_MS);
  });
});

describe('clampTargetMs', () => {
  it('snaps onto the whole-second grid', () => {
    expect(clampTargetMs(5_400)).toBe(5_000);
    expect(clampTargetMs(5_600)).toBe(6_000);
  });

  it('pulls anything out of range back inside it', () => {
    expect(clampTargetMs(-5)).toBe(MIN_TARGET_MS);
    expect(clampTargetMs(60_000)).toBe(MAX_TARGET_MS);
    expect(clampTargetMs(Number.NaN)).toBe(MIN_TARGET_MS);
  });
});

describe('planRound', () => {
  it('gives reflex rounds no target to count', () => {
    expect(planRound('reflex', constant(0.5), 6_000)).toEqual({
      mode: 'reflex',
      delayMs: 3_000,
      targetMs: null,
    });
  });

  it('randomises the target in count rounds', () => {
    expect(planRound('count', constant(0), 6_000).targetMs).toBe(MIN_TARGET_MS);
  });

  it('honours the locked target rather than rolling one', () => {
    expect(planRound('lock', constant(0), 6_000).targetMs).toBe(6_000);
  });

  it('still randomises the dark wait in locked rounds', () => {
    expect(planRound('lock', constant(0.25), 6_000).delayMs).toBe(2_000);
  });
});
