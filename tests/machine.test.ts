import { describe, expect, it } from 'vitest';

import {
  COUNT_OVERRUN_TIMEOUT_MS,
  REFLEX_TIMEOUT_MS,
  RETRY_LOCKOUT_MS,
} from '../src/game/constants';
import { initialState, isTerminal, step } from '../src/game/machine';
import type { GameEvent, GameState, RoundPlan } from '../src/game/types';

const reflexPlan: RoundPlan = {
  mode: 'reflex',
  delayMs: 2_000,
  targetMs: null,
};
const countPlan: RoundPlan = { mode: 'count', delayMs: 2_000, targetMs: 3_000 };

/** Runs a sequence of events and hands back the final state plus every effect. */
function drive(
  events: readonly GameEvent[],
  from: GameState = initialState,
): { state: GameState; effects: ReturnType<typeof step>['effects'] } {
  let state = from;
  const effects: ReturnType<typeof step>['effects'] = [];
  for (const event of events) {
    const result = step(state, event);
    state = result.state;
    effects.push(...result.effects);
  }
  return { state, effects };
}

/** Arms, runs to the flash and reports the frame as presented at `flashAt`. */
function upToFlash(plan: RoundPlan, flashAt = 2_016): GameState {
  return drive([
    { type: 'arm', at: 0, plan },
    { type: 'frame', at: plan.delayMs },
    { type: 'flashPresented', at: flashAt },
  ]).state;
}

describe('arming', () => {
  it('starts a round dark, with no flash timestamp yet', () => {
    const { state } = drive([{ type: 'arm', at: 100, plan: reflexPlan }]);
    expect(state.phase).toBe('armed');
    expect(state.armedAt).toBe(100);
    expect(state.flashAt).toBeNull();
  });

  it('holds still until the delay has elapsed', () => {
    const armed = drive([{ type: 'arm', at: 0, plan: reflexPlan }]).state;
    const result = step(armed, { type: 'frame', at: 1_999 });

    expect(result.state).toBe(armed);
    expect(result.effects).toHaveLength(0);
  });

  it('paints on the first frame at or past the delay', () => {
    const armed = drive([{ type: 'arm', at: 0, plan: reflexPlan }]).state;
    const result = step(armed, { type: 'frame', at: 2_000 });

    expect(result.state.phase).toBe('flashPending');
    expect(result.effects).toEqual([{ type: 'paintFlash', hold: true }]);
  });

  it('pulses rather than holds the flash in the counting modes', () => {
    const armed = drive([{ type: 'arm', at: 0, plan: countPlan }]).state;
    const { effects } = step(armed, { type: 'frame', at: 2_100 });

    expect(effects).toEqual([{ type: 'paintFlash', hold: false }]);
  });
});

describe('the flash timestamp', () => {
  it('is the frame that presented it, not the frame that asked for it', () => {
    const state = upToFlash(reflexPlan, 2_016);
    expect(state.phase).toBe('signal');
    expect(state.flashAt).toBe(2_016);
  });

  it('sends the counting modes into the dark instead of a lit signal', () => {
    expect(upToFlash(countPlan).phase).toBe('counting');
  });

  it('ignores a presentation report that arrives out of phase', () => {
    const armed = drive([{ type: 'arm', at: 0, plan: reflexPlan }]).state;
    expect(step(armed, { type: 'flashPresented', at: 10 }).state).toBe(armed);
  });
});

describe('reflex rounds', () => {
  it('scores the gap between the presented frame and the press', () => {
    const signal = upToFlash(reflexPlan, 2_016);
    const { state } = drive([{ type: 'press', at: 2_200 }], signal);

    expect(state.phase).toBe('result');
    expect(state.outcome).toEqual({ kind: 'reaction', reactionMs: 184 });
  });

  it('emits the score once the round settles', () => {
    const signal = upToFlash(reflexPlan, 2_016);
    const { effects } = step(signal, { type: 'press', at: 2_200 });

    expect(effects).toEqual([
      { type: 'clearFlash' },
      {
        type: 'settled',
        outcome: { kind: 'reaction', reactionMs: 184 },
        plan: reflexPlan,
      },
    ]);
  });

  it('calls a press during the dark wait a false start', () => {
    const armed = drive([{ type: 'arm', at: 0, plan: reflexPlan }]).state;
    const { state } = drive([{ type: 'press', at: 1_600 }], armed);

    expect(state.phase).toBe('falseStart');
    expect(state.outcome).toEqual({ kind: 'falseStart', earlyByMs: 400 });
  });

  it('calls a press between the paint and the vsync a false start too', () => {
    const pending = drive([
      { type: 'arm', at: 0, plan: reflexPlan },
      { type: 'frame', at: 2_000 },
    ]).state;

    expect(drive([{ type: 'press', at: 2_004 }], pending).state.phase).toBe(
      'falseStart',
    );
  });

  it('refuses a press stamped before the flash reached the screen', () => {
    const signal = upToFlash(reflexPlan, 2_016);
    const { state } = drive([{ type: 'press', at: 2_010 }], signal);

    expect(state.phase).toBe('falseStart');
  });

  it('drops a signal nobody answers', () => {
    const signal = upToFlash(reflexPlan, 2_000);
    const { state } = drive(
      [{ type: 'frame', at: 2_000 + REFLEX_TIMEOUT_MS }],
      signal,
    );

    expect(state.phase).toBe('abandoned');
    expect(state.outcome).toEqual({ kind: 'abandoned' });
  });
});

describe('counting rounds', () => {
  it('burns a press that lands before the target', () => {
    const counting = upToFlash(countPlan, 2_000);
    const { state } = drive([{ type: 'press', at: 4_800 }], counting);

    expect(state.phase).toBe('tooEarly');
    expect(state.outcome).toEqual({
      kind: 'tooEarly',
      targetMs: 3_000,
      elapsedMs: 2_800,
      shortByMs: 200,
    });
  });

  it('burns a press that is early by a single millisecond', () => {
    const counting = upToFlash(countPlan, 2_000);
    expect(drive([{ type: 'press', at: 4_999 }], counting).state.phase).toBe(
      'tooEarly',
    );
  });

  it('accepts a press exactly on the target', () => {
    const counting = upToFlash(countPlan, 2_000);
    const { state } = drive([{ type: 'press', at: 5_000 }], counting);

    expect(state.outcome).toEqual({
      kind: 'timed',
      targetMs: 3_000,
      elapsedMs: 3_000,
      errorMs: 0,
    });
  });

  it('scores overshoot as the error', () => {
    const counting = upToFlash(countPlan, 2_000);
    const { state } = drive([{ type: 'press', at: 5_184 }], counting);

    expect(state.phase).toBe('result');
    expect(state.outcome).toEqual({
      kind: 'timed',
      targetMs: 3_000,
      elapsedMs: 3_184,
      errorMs: 184,
    });
  });

  it('drops a round that overruns the target for too long', () => {
    const counting = upToFlash(countPlan, 2_000);
    const { state } = drive(
      [{ type: 'frame', at: 2_000 + 3_000 + COUNT_OVERRUN_TIMEOUT_MS }],
      counting,
    );

    expect(state.phase).toBe('abandoned');
  });

  it('keeps counting while the player is still within the overrun window', () => {
    const counting = upToFlash(countPlan, 2_000);
    const result = step(counting, { type: 'frame', at: 9_000 });

    expect(result.state).toBe(counting);
  });
});

describe('retrying', () => {
  const settledAt = 10_000;

  function settled(): GameState {
    const signal = upToFlash(reflexPlan, 2_000);
    return drive([{ type: 'press', at: settledAt }], signal).state;
  }

  it('swallows the bounce from the press that ended the round', () => {
    const state = settled();
    const result = step(state, {
      type: 'press',
      at: settledAt + RETRY_LOCKOUT_MS - 1,
    });

    expect(result.effects).toHaveLength(0);
    expect(result.state).toBe(state);
  });

  it('asks for a new round once the lockout has passed', () => {
    const { effects } = step(settled(), {
      type: 'press',
      at: settledAt + RETRY_LOCKOUT_MS,
    });

    expect(effects).toEqual([{ type: 'requestArm' }]);
  });

  it('treats a press on the home screen as a request to play', () => {
    const { effects } = step(initialState, { type: 'press', at: 1 });
    expect(effects).toEqual([{ type: 'requestArm' }]);
  });

  it('returns to the start on abort', () => {
    const { state, effects } = step(upToFlash(countPlan), { type: 'abort' });

    expect(state).toEqual(initialState);
    expect(effects).toEqual([{ type: 'clearFlash' }]);
  });
});

describe('isTerminal', () => {
  it('covers exactly the phases that end a round', () => {
    expect(isTerminal('result')).toBe(true);
    expect(isTerminal('falseStart')).toBe(true);
    expect(isTerminal('tooEarly')).toBe(true);
    expect(isTerminal('abandoned')).toBe(true);

    expect(isTerminal('idle')).toBe(false);
    expect(isTerminal('armed')).toBe(false);
    expect(isTerminal('flashPending')).toBe(false);
    expect(isTerminal('signal')).toBe(false);
    expect(isTerminal('counting')).toBe(false);
  });
});
