import {
  COUNT_OVERRUN_TIMEOUT_MS,
  REFLEX_TIMEOUT_MS,
  RETRY_LOCKOUT_MS,
} from './constants';
import type {
  Effect,
  GameEvent,
  GameState,
  Outcome,
  Phase,
  RoundPlan,
  StepResult,
} from './types';

export const initialState: GameState = Object.freeze({
  phase: 'idle',
  plan: null,
  armedAt: null,
  flashAt: null,
  settledAt: null,
  outcome: null,
});

const TERMINAL_PHASES: readonly Phase[] = [
  'result',
  'falseStart',
  'tooEarly',
  'abandoned',
];

export function isTerminal(phase: Phase): boolean {
  return TERMINAL_PHASES.includes(phase);
}

/** Nothing happened. Returning the same reference lets the shell skip a render. */
function unchanged(state: GameState): StepResult {
  return { state, effects: [] };
}

function settle(
  state: GameState,
  plan: RoundPlan,
  phase: Phase,
  at: number,
  outcome: Outcome,
): StepResult {
  return {
    state: { ...state, phase, settledAt: at, outcome },
    effects: [{ type: 'clearFlash' }, { type: 'settled', outcome, plan }],
  };
}

function onFrame(state: GameState, at: number): StepResult {
  const { plan } = state;
  if (plan === null) return unchanged(state);

  if (state.phase === 'armed' && state.armedAt !== null) {
    if (at - state.armedAt < plan.delayMs) return unchanged(state);
    // Paint inside this very frame so the mutation rides the frame we are in;
    // the shell reports the vsync that presents it back as `flashPresented`.
    return {
      state: { ...state, phase: 'flashPending' },
      effects: [{ type: 'paintFlash', hold: plan.mode === 'reflex' }],
    };
  }

  if (state.flashAt === null) return unchanged(state);
  const sinceFlash = at - state.flashAt;

  if (state.phase === 'signal' && sinceFlash >= REFLEX_TIMEOUT_MS) {
    return settle(state, plan, 'abandoned', at, { kind: 'abandoned' });
  }

  if (
    state.phase === 'counting' &&
    plan.targetMs !== null &&
    sinceFlash >= plan.targetMs + COUNT_OVERRUN_TIMEOUT_MS
  ) {
    return settle(state, plan, 'abandoned', at, { kind: 'abandoned' });
  }

  return unchanged(state);
}

function onFlashPresented(state: GameState, at: number): StepResult {
  if (state.phase !== 'flashPending' || state.plan === null) {
    return unchanged(state);
  }
  return {
    state: {
      ...state,
      phase: state.plan.mode === 'reflex' ? 'signal' : 'counting',
      flashAt: at,
    },
    effects: [],
  };
}

function onPress(state: GameState, at: number): StepResult {
  if (state.phase === 'idle') {
    return { state, effects: [{ type: 'requestArm' }] };
  }

  if (isTerminal(state.phase)) {
    const ready =
      state.settledAt !== null && at - state.settledAt >= RETRY_LOCKOUT_MS;
    return ready
      ? { state, effects: [{ type: 'requestArm' }] }
      : unchanged(state);
  }

  const { plan } = state;
  if (plan === null) return unchanged(state);

  if (state.phase === 'armed' && state.armedAt !== null) {
    const earlyByMs = Math.max(0, state.armedAt + plan.delayMs - at);
    return settle(state, plan, 'falseStart', at, {
      kind: 'falseStart',
      earlyByMs,
    });
  }

  // The flash was written to the DOM but has not been presented yet, so this
  // press was committed while the screen was still dark.
  if (state.phase === 'flashPending') {
    return settle(state, plan, 'falseStart', at, {
      kind: 'falseStart',
      earlyByMs: 0,
    });
  }

  if (state.flashAt === null) return unchanged(state);
  const elapsedMs = at - state.flashAt;

  if (state.phase === 'signal') {
    // An input stamped before the flash frame reached the screen cannot be a
    // reaction to it, however tempting the small positive number would look.
    if (elapsedMs <= 0) {
      return settle(state, plan, 'falseStart', at, {
        kind: 'falseStart',
        earlyByMs: 0,
      });
    }
    return settle(state, plan, 'result', at, {
      kind: 'reaction',
      reactionMs: elapsedMs,
    });
  }

  if (state.phase === 'counting' && plan.targetMs !== null) {
    const elapsed = Math.max(0, elapsedMs);
    if (elapsed < plan.targetMs) {
      return settle(state, plan, 'tooEarly', at, {
        kind: 'tooEarly',
        targetMs: plan.targetMs,
        elapsedMs: elapsed,
        shortByMs: plan.targetMs - elapsed,
      });
    }
    return settle(state, plan, 'result', at, {
      kind: 'timed',
      targetMs: plan.targetMs,
      elapsedMs: elapsed,
      errorMs: elapsed - plan.targetMs,
    });
  }

  return unchanged(state);
}

export function step(state: GameState, event: GameEvent): StepResult {
  switch (event.type) {
    case 'abort':
      return {
        state: initialState,
        effects: [{ type: 'clearFlash' } satisfies Effect],
      };
    case 'arm':
      return {
        state: {
          phase: 'armed',
          plan: event.plan,
          armedAt: event.at,
          flashAt: null,
          settledAt: null,
          outcome: null,
        },
        effects: [{ type: 'clearFlash' }],
      };
    case 'frame':
      return onFrame(state, event.at);
    case 'flashPresented':
      return onFlashPresented(state, event.at);
    case 'press':
      return onPress(state, event.at);
  }
}
