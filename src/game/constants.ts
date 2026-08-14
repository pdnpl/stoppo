/** Shortest dark wait before the flash. Below ~1s players can anticipate it. */
export const MIN_DELAY_MS = 1_000;

/** Longest dark wait before the flash. */
export const MAX_DELAY_MS = 5_000;

/** Shortest interval a player can be asked to count out. */
export const MIN_TARGET_MS = 2_000;

/** Longest interval a player can be asked to count out. */
export const MAX_TARGET_MS = 10_000;

/** Targets are whole seconds — easier to hold in your head, easier to read. */
export const TARGET_STEP_MS = 1_000;

/** How long the flash stays lit in the counting modes before darkness returns. */
export const FLASH_PULSE_MS = 120;

/**
 * Presses are ignored for this long after a round ends, so the tap that ended
 * the round cannot bounce into the next one. Humans need ~120ms to re-tap, so
 * this is invisible while still catching stray multi-touch events.
 */
export const RETRY_LOCKOUT_MS = 90;

/** A lit flash nobody answers is abandoned after this long. */
export const REFLEX_TIMEOUT_MS = 5_000;

/** Counting rounds are abandoned this long past the target. */
export const COUNT_OVERRUN_TIMEOUT_MS = 10_000;
