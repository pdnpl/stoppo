import { initialState, step } from '../game/machine';
import type {
  Effect,
  GameEvent,
  GameState,
  Outcome,
  Phase,
  RoundPlan,
} from '../game/types';

export interface EngineHost {
  /** Put the flash on screen synchronously, inside the frame we are already in. */
  paintFlash(hold: boolean): void;
  /** Take the flash back off. */
  clearFlash(): void;
  /** Called after every state change so the shell can render. */
  render(state: GameState): void;
  /** A round produced a verdict. */
  settled(outcome: Outcome, plan: RoundPlan): void;
  /** The player asked for another round; the shell decides what that is. */
  nextPlan(): RoundPlan;
}

const FRAME_DRIVEN: readonly Phase[] = [
  'armed',
  'flashPending',
  'signal',
  'counting',
];

export class Engine {
  private state: GameState = initialState;
  private rafId: number | null = null;
  private awaitingPresentation = false;

  constructor(private readonly host: EngineHost) {}

  get current(): GameState {
    return this.state;
  }

  /** Starts a round with a plan the shell has chosen. */
  arm(plan: RoundPlan): void {
    this.dispatch({ type: 'arm', at: performance.now(), plan });
  }

  /** A press, stamped with when the input really happened. */
  press(at: number): void {
    this.dispatch({ type: 'press', at });
  }

  /** Abandons whatever is running and returns to the home screen. */
  abort(): void {
    this.dispatch({ type: 'abort' });
  }

  private dispatch(event: GameEvent): void {
    const previous = this.state;
    const { state, effects } = step(previous, event);
    this.state = state;

    // Re-arming is deferred past the render so a retry never re-enters dispatch
    // mid-flight and leaves the shell painting a state that is already stale.
    let rearm = false;
    for (const effect of effects) {
      if (effect.type === 'requestArm') {
        rearm = true;
        continue;
      }
      this.apply(effect);
    }

    if (state !== previous) this.host.render(state);
    this.syncLoop();

    if (rearm) this.arm(this.host.nextPlan());
  }

  private apply(effect: Effect): void {
    switch (effect.type) {
      case 'paintFlash':
        // Mutating here means the change rides the frame we are already inside;
        // the very next frame callback is the vsync that presents it.
        this.host.paintFlash(effect.hold);
        this.awaitingPresentation = true;
        break;
      case 'clearFlash':
        this.awaitingPresentation = false;
        this.host.clearFlash();
        break;
      case 'settled':
        this.host.settled(effect.outcome, effect.plan);
        break;
      case 'requestArm':
        // Hoisted out of the effect loop by `dispatch`.
        break;
    }
  }

  private syncLoop(): void {
    const wanted = FRAME_DRIVEN.includes(this.state.phase);
    if (wanted && this.rafId === null) this.start();
    if (!wanted && this.rafId !== null) this.stop();
  }

  private start(): void {
    const tick = (timestamp: number): void => {
      this.rafId = requestAnimationFrame(tick);

      // This callback fires at the vsync that puts the previous frame — the one
      // we painted the flash into — on the glass. That instant, and not the
      // moment we asked for it, is what every score is measured against.
      if (this.awaitingPresentation) {
        this.awaitingPresentation = false;
        this.dispatch({ type: 'flashPresented', at: timestamp });
      }

      this.dispatch({ type: 'frame', at: timestamp });
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
}
