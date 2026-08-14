# 7. An early press burns the round

- Status: Accepted
- Date: 2026-08-14

## Context

In the counting modes the player aims at a target interval. The obvious scoring
rule is "closest wins", scoring the absolute distance from the target in either
direction.

That rule has a quiet problem: it rewards hedging. If early and late cost the
same, the safest play is to aim short, because a short guess ends the round
sooner and feels less exposed. The result is a game where the dominant strategy
is impatience, which is the opposite of the faculty the mode exists to train.

## Decision

Pressing before the target burns the round. Not "scores badly" — burnt, with no
number recorded, exactly like a false start in Reflex.

Overshoot is scored normally: the error in milliseconds, lower being better.

## Consequences

- Optimal play is to aim a hair late, so the game punishes impatience rather
  than bad luck. That asymmetry is the whole point.
- The failure is informative rather than blank: an early press reports how many
  milliseconds short it was, so the player learns which way their internal clock
  runs.
- Because a burnt round records nothing, records cannot be gamed by spamming
  early presses.
- Cost: it is harsh on a first-time player, who will burn several rounds before
  the rule lands. Mitigated by naming it on the home screen — "Early is burnt" —
  before they ever press anything.

## Alternatives considered

**Closest wins, absolute error.** Standard, symmetrical, and rewards the wrong
instinct. Rejected.

**A grace window, say 100ms early still counts.** Softer, but it just moves the
target and re-introduces the hedging incentive against a fuzzier line.

**Scoring early presses with a penalty multiplier.** More arithmetic on screen,
same incentive problem, and it turns a clean binary into something a player has
to model.
