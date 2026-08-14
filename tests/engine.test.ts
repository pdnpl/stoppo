import { afterEach, describe, expect, it, vi } from 'vitest';

import { Engine } from '../src/engine/engine';
import type { EngineHost } from '../src/engine/engine';
import type { Outcome, RoundPlan } from '../src/game/types';

/**
 * A display we can turn by hand. `frame()` is one vsync: it moves the clock and
 * runs whatever was queued, exactly like a browser would.
 */
class FakeDisplay {
  now = 0;
  private callbacks = new Map<number, FrameRequestCallback>();
  private nextId = 1;

  get pending(): number {
    return this.callbacks.size;
  }

  request = (callback: FrameRequestCallback): number => {
    const id = this.nextId;
    this.nextId += 1;
    this.callbacks.set(id, callback);
    return id;
  };

  cancel = (id: number): void => {
    this.callbacks.delete(id);
  };

  frame(deltaMs = 16.667): void {
    this.now += deltaMs;
    const due = [...this.callbacks.values()];
    this.callbacks.clear();
    for (const callback of due) callback(this.now);
  }

  frames(count: number, deltaMs?: number): void {
    for (let i = 0; i < count; i += 1) this.frame(deltaMs);
  }
}

interface Harness {
  engine: Engine;
  display: FakeDisplay;
  paints: boolean[];
  clears: { count: number };
  settlements: { outcome: Outcome; plan: RoundPlan }[];
}

function reflex(delayMs: number): RoundPlan {
  return { mode: 'reflex', delayMs, targetMs: null };
}

function counted(delayMs: number, targetMs: number): RoundPlan {
  return { mode: 'count', delayMs, targetMs };
}

/** Wires an engine to a fake display and takes over the browser globals. */
function harness(retryQueue: RoundPlan[] = []): Harness {
  const display = new FakeDisplay();
  vi.stubGlobal('requestAnimationFrame', display.request);
  vi.stubGlobal('cancelAnimationFrame', display.cancel);
  vi.stubGlobal('performance', { now: () => display.now });

  const paints: boolean[] = [];
  const clears = { count: 0 };
  const settlements: { outcome: Outcome; plan: RoundPlan }[] = [];
  const queue = [...retryQueue];

  const host: EngineHost = {
    paintFlash: (hold) => paints.push(hold),
    clearFlash: () => {
      clears.count += 1;
    },
    render: () => undefined,
    settled: (outcome, plan) => settlements.push({ outcome, plan }),
    nextPlan: () => queue.shift() ?? reflex(1_000),
  };

  return { engine: new Engine(host), display, paints, clears, settlements };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Engine on a hand-cranked display', () => {
  it('paints the flash on the first frame past the delay', () => {
    const h = harness();
    h.engine.arm(reflex(50));

    h.display.frame(); // 16.7 — too early
    expect(h.paints).toEqual([]);

    h.display.frame(); // 33.3 — still too early
    h.display.frame(); // 50.0 — due
    expect(h.paints).toEqual([true]);
  });

  it('timestamps the flash at the vsync that showed it, not the one that drew it', () => {
    const h = harness();
    h.engine.arm(reflex(50));
    h.display.frames(3); // the paint rides this frame

    const paintedInFrame = h.display.now;
    expect(h.engine.current.flashAt).toBeNull();

    h.display.frame(); // the vsync that puts it on the glass
    expect(h.engine.current.phase).toBe('signal');
    expect(h.engine.current.flashAt).toBeGreaterThan(paintedInFrame);
    expect(h.engine.current.flashAt).toBe(h.display.now);
  });

  it('scores against that timestamp, so a frame of paint latency is not charged to the player', () => {
    const h = harness();
    h.engine.arm(reflex(50));
    h.display.frames(4);

    const flashAt = h.engine.current.flashAt!;
    h.engine.press(flashAt + 184);

    expect(h.settlements).toHaveLength(1);
    expect(h.settlements[0]!.outcome).toEqual({
      kind: 'reaction',
      reactionMs: 184,
    });
  });

  it('holds the flash for reflex and pulses it for counting', () => {
    const reflexRun = harness();
    reflexRun.engine.arm(reflex(50));
    reflexRun.display.frames(3);
    expect(reflexRun.paints).toEqual([true]);

    const countRun = harness();
    countRun.engine.arm(counted(50, 3_000));
    countRun.display.frames(3);
    expect(countRun.paints).toEqual([false]);
  });

  it('takes the flash back down when a round settles', () => {
    const h = harness();
    h.engine.arm(reflex(50));
    h.display.frames(4);
    const before = h.clears.count;

    h.engine.press(h.engine.current.flashAt! + 200);
    expect(h.clears.count).toBeGreaterThan(before);
  });

  it('stops asking for frames once there is nothing left to time', () => {
    const h = harness();
    h.engine.arm(reflex(50));
    h.display.frames(4);
    expect(h.display.pending).toBe(1);

    h.engine.press(h.engine.current.flashAt! + 200);
    expect(h.display.pending).toBe(0);
  });

  it('arms the next round from the host once the retry lockout has passed', () => {
    const h = harness([reflex(999)]);
    h.engine.arm(reflex(50));
    h.display.frames(4);

    const settledAt = h.engine.current.flashAt! + 200;
    h.engine.press(settledAt);
    h.engine.press(settledAt + 10); // swallowed by the lockout
    expect(h.engine.current.phase).toBe('result');

    h.engine.press(settledAt + 200);
    expect(h.engine.current.phase).toBe('armed');
    expect(h.engine.current.plan?.delayMs).toBe(999);
  });

  it('runs a counted round entirely in the dark and scores the overshoot', () => {
    const h = harness();
    h.engine.arm(counted(50, 3_000));
    h.display.frames(4);

    expect(h.engine.current.phase).toBe('counting');
    const flashAt = h.engine.current.flashAt!;

    h.engine.press(flashAt + 3_142);
    expect(h.settlements[0]!.outcome).toEqual({
      kind: 'timed',
      targetMs: 3_000,
      elapsedMs: 3_142,
      errorMs: 142,
    });
  });

  it('lets go of the round entirely on abort', () => {
    const h = harness();
    h.engine.arm(reflex(50));
    h.display.frames(2);

    h.engine.abort();
    expect(h.engine.current.phase).toBe('idle');
    expect(h.display.pending).toBe(0);
  });
});
