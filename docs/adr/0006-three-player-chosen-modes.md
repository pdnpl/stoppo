# 6. Three player-chosen modes: Reflex, Count, Lock

- Status: Accepted
- Date: 2026-08-14

## Context

A single tap after a single flash is a clean benchmark and a thin game. Ten
rounds in, there is nothing left to get better at except the number.

The instinct is to add taps — "tap three times when it lights up". That adds
effort without adding risk: the round takes longer, but there is still no way to
lose it, and the score stops being a reaction time and starts being a mixture of
reaction and finger speed.

The interesting observation is that the opposite skill makes a better companion.
Reacting fast means switching deliberation off. Counting an interval out in the
dark means holding an impulse back. They are two different faculties, they train
against each other, and both end in the same gesture: stopping a clock.

## Decision

Three modes, chosen by the player on the home screen:

| Mode       | Round                                                               | Score                     |
| ---------- | ------------------------------------------------------------------- | ------------------------- |
| **Reflex** | Dark 1–5s, flash holds, press at once                               | Reaction time, ms         |
| **Count**  | A random 2–10s target, shown before the flash; count it in the dark | Overshoot, ms             |
| **Lock**   | The same, with a target the player picks and keeps                  | Overshoot, ms, per target |

The governing rule: **randomise the stimulus, never the contract.** The mode,
and in Lock the interval, are promises the player made to themselves before the
round started. What the game randomises is the dark wait in every mode and the
target in Count — the things a player cannot reasonably rehearse.

In the counting modes the flash is a 120ms pulse rather than a lamp, and the
screen then goes fully dark. Any moving pixel would be a clock the player could
read, so the only thing left on screen is a dimmed reminder of the target
number — because forgetting the number is not the skill being measured.

## Consequences

- Reflex remains a pure, comparable benchmark; the counting modes cannot
  contaminate it, because they are separate records.
- Lock keeps a record per interval, so a player training 6s can watch that
  number fall without a lucky 2s round flattering the average.
- The home screen carries a mode picker, which is the price of the contract
  rule. It is one screen with three buttons and a row of chips, and it is
  remembered between visits.

## Alternatives considered

**Multi-tap burst (tap N times on the flash).** The original suggestion. Adds
effort, not risk; dilutes the reaction measurement with tapping speed. A variant
that reveals the digit _in_ the flash would add real risk via a reading step,
and is worth reconsidering as a fourth mode — but not at the cost of shipping
three coherent ones.

**Go / No-Go (a red flash you must not touch).** Genuinely good: real risk every
round, no contamination of the score. Rejected for v1 only because the counting
modes already supply the tension and stacking both makes the mode picker a menu.
The strongest candidate for the next thing added.

**Run of five rounds averaged.** Pleasant session shape, but a Count round can
run 15 seconds; five of them is a ninety-second commitment before any feedback.
Wrong rhythm for a game whose selling point is instant retry.

**The game picking the mode at random each round.** Breaks the contract rule.
When a score is measured in milliseconds, being surprised by the rules reads as
cheating rather than challenge.
