/**
 * The timestamp a press actually happened at, not the timestamp our handler got
 * around to running at.
 *
 * Trusted input events carry a `timeStamp` taken when the event was created,
 * on the same monotonic clock as `performance.now()`. Using it removes the
 * queueing delay between the finger landing and JavaScript waking up — which on
 * a busy main thread is worth tens of milliseconds in a game measured in them.
 *
 * Older engines stamped events with epoch milliseconds instead, and synthetic
 * events can carry anything at all, so anything that cannot be on the
 * performance timeline falls back to reading the clock right now.
 */
export function inputTime(event: Event): number {
  const now = performance.now();
  const stamp = event.timeStamp;

  if (!Number.isFinite(stamp) || stamp <= 0) return now;
  if (stamp > now + 1) return now;

  return stamp;
}
