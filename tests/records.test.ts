import { describe, expect, it } from 'vitest';

import {
  STORAGE_KEY,
  bestFor,
  emptyRecords,
  loadRecords,
  saveRecords,
  submitScore,
} from '../src/game/records';
import type { StorageLike } from '../src/game/records';

function fakeStorage(seed: Record<string, string> = {}): StorageLike {
  const data = { ...seed };
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

const hostileStorage: StorageLike = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('full');
  },
};

describe('loadRecords', () => {
  it('starts empty when there is nothing stored', () => {
    expect(loadRecords(fakeStorage())).toEqual(emptyRecords());
  });

  it('reads back what was written', () => {
    const storage = fakeStorage();
    saveRecords(storage, { reflex: 182, count: 210, lock: { '6': 95 } });

    expect(loadRecords(storage)).toEqual({
      reflex: 182,
      count: 210,
      lock: { '6': 95 },
    });
  });

  it('throws away corrupt or hostile payloads instead of crashing', () => {
    expect(loadRecords(fakeStorage({ [STORAGE_KEY]: 'not json' }))).toEqual(
      emptyRecords(),
    );

    const junk = JSON.stringify({
      reflex: 'fast',
      count: -1,
      lock: { six: 100, '6': 'quick', '7': 120 },
    });
    expect(loadRecords(fakeStorage({ [STORAGE_KEY]: junk }))).toEqual({
      reflex: null,
      count: null,
      lock: { '7': 120 },
    });
  });

  it('shrugs off storage that refuses to work at all', () => {
    expect(loadRecords(hostileStorage)).toEqual(emptyRecords());
    expect(() => {
      saveRecords(hostileStorage, emptyRecords());
    }).not.toThrow();
    expect(loadRecords(null)).toEqual(emptyRecords());
  });
});

describe('submitScore', () => {
  it('takes the first score in a mode', () => {
    const { records, isRecord } = submitScore(
      emptyRecords(),
      'reflex',
      null,
      212,
    );

    expect(isRecord).toBe(true);
    expect(records.reflex).toBe(212);
  });

  it('only replaces a record with a lower number', () => {
    const first = submitScore(emptyRecords(), 'reflex', null, 212).records;

    const worse = submitScore(first, 'reflex', null, 260);
    expect(worse.isRecord).toBe(false);
    expect(worse.records).toBe(first);

    const better = submitScore(first, 'reflex', null, 190);
    expect(better.isRecord).toBe(true);
    expect(better.records.reflex).toBe(190);
  });

  it('keeps a separate record per locked interval', () => {
    let records = emptyRecords();
    records = submitScore(records, 'lock', 6_000, 120).records;
    records = submitScore(records, 'lock', 9_000, 400).records;

    expect(bestFor(records, 'lock', 6_000)).toBe(120);
    expect(bestFor(records, 'lock', 9_000)).toBe(400);
    expect(bestFor(records, 'lock', 3_000)).toBeNull();
  });

  it('does not let reflex and count records bleed into each other', () => {
    const records = submitScore(emptyRecords(), 'count', 4_000, 88).records;

    expect(bestFor(records, 'count', 4_000)).toBe(88);
    expect(bestFor(records, 'reflex', null)).toBeNull();
  });

  it('has nowhere to file a locked score with no interval', () => {
    const { isRecord } = submitScore(emptyRecords(), 'lock', null, 100);
    expect(isRecord).toBe(false);
  });
});
