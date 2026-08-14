/** The three ways to play. Chosen by the player, never by the game. */
export type Mode = 'reflex' | 'count' | 'lock';

export type Phase =
  /** Nothing scheduled — the home screen is up. */
  | 'idle'
  /** Dark, counting down to the flash. A press here is a false start. */
  | 'armed'
  /** The flash was written to the DOM; waiting for the frame that shows it. */
  | 'flashPending'
  /** REFLEX: the flash is lit and the player should press now. */
  | 'signal'
  /** COUNT/LOCK: the flash has fired and the player is counting in the dark. */
  | 'counting'
  /** Round scored. */
  | 'result'
  /** Pressed before the flash. */
  | 'falseStart'
  /** COUNT/LOCK: pressed before the target elapsed. */
  | 'tooEarly'
  /** Nobody pressed in time. */
  | 'abandoned';

export interface RoundPlan {
  mode: Mode;
  /** Dark wait between arming and the flash. */
  delayMs: number;
  /** COUNT/LOCK: interval to count out after the flash. `null` for REFLEX. */
  targetMs: number | null;
}

export type Outcome =
  | { kind: 'reaction'; reactionMs: number }
  | { kind: 'timed'; targetMs: number; elapsedMs: number; errorMs: number }
  | { kind: 'falseStart'; earlyByMs: number }
  | { kind: 'tooEarly'; targetMs: number; elapsedMs: number; shortByMs: number }
  | { kind: 'abandoned' };

export interface GameState {
  phase: Phase;
  plan: RoundPlan | null;
  /** Timestamp the round was armed at. */
  armedAt: number | null;
  /**
   * Timestamp of the frame that actually put the flash on screen — the zero
   * point every score is measured from. Never a "we asked for it" timestamp.
   */
  flashAt: number | null;
  /** When the current terminal phase was entered, for the retry lockout. */
  settledAt: number | null;
  outcome: Outcome | null;
}

export type GameEvent =
  | { type: 'arm'; at: number; plan: RoundPlan }
  | { type: 'frame'; at: number }
  | { type: 'flashPresented'; at: number }
  | { type: 'press'; at: number }
  | { type: 'abort' };

export type Effect =
  /**
   * Paint the flash *now*, inside the current frame, then report back with
   * `flashPresented` on the next frame. `hold` keeps it lit until the press
   * (REFLEX); otherwise it is a short pulse and darkness returns.
   */
  | { type: 'paintFlash'; hold: boolean }
  | { type: 'clearFlash' }
  | { type: 'settled'; outcome: Outcome; plan: RoundPlan }
  /** The player wants another round; the shell decides what to arm next. */
  | { type: 'requestArm' };

export interface StepResult {
  state: GameState;
  effects: Effect[];
}
