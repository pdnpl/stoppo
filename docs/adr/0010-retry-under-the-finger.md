# 10. The retry target appears under the finger

- Status: Accepted
- Date: 2026-08-14

## Context

The brief was specific: after a lost round an adult player wants another go
inside a fraction of a second, and any distance between the finger and the retry
control is friction they will feel every single time.

A retry button in a fixed position is a small journey away from wherever the
hand already is, and after a false start the hand is exactly where the mistake
happened.

## Decision

Two things, together:

1. **The whole stage retries.** Any press anywhere on the play surface starts
   the next round once a round has settled.
2. **The button comes to the finger.** The circular _Again_ target is positioned
   at the coordinates of the press that ended the round, clamped to stay fully
   on screen. It is a real `<button>`, so keyboard and assistive technology get
   the same affordance; without a pointer it falls back to the lower centre.

Presses within 90ms of a round settling are ignored. Humans need roughly 120ms
to lift and re-press, so the lockout is invisible in play while still absorbing
the stray second touch that would otherwise consume the retry.

## Consequences

- The gesture after a false start is "press again where you already are", which
  is as close to zero friction as the medium allows.
- The button is an affordance rather than the mechanism, so nobody has to aim.
- The back-to-modes control has to stop its press from bubbling into a retry,
  and it is disabled outright while a round is live, so it can never eat a
  scoring press.
- Cost: a control that moves is unusual, and would be a bad idea in an
  application. In a single-surface game where the alternative is a journey, it
  is the right trade.

## Alternatives considered

**A fixed retry button.** Predictable, and a measurable distance from the finger
on every single retry.

**Tap-anywhere with no button at all.** Nearly as fast, but leaves nothing to
tell a first-time player — or a screen reader — that another round is one press
away.

**Auto-restarting after a delay.** Removes the choice, and a player who wants to
sit with a bad number for a second gets ambushed by the next dark wait.
