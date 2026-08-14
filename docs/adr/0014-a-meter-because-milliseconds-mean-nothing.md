# 14. A quality meter, because "ms" means nothing to most people

- Status: Accepted
- Date: 2026-08-15

## Context

The result screen led with a large number and the letters `ms`. That is precise
and, for anyone who does not already know what a good reaction time looks like,
uninformative: `311 ms` carries no sense of whether it was quick, and the unit
itself is jargon.

The same screen had grown to five stacked lines, and with the retry control
floating over the middle of it, the whole thing overlapped into an unreadable
pile.

## Decision

**A horizontal meter that fills by quality.** Long bar, good round. It sits
directly under the number and is the fastest thing on screen to read.

- Reflex fills at 120ms and empties at 500ms.
- Counting fills at a perfect hit and empties 1.5s out.
- The fill is cyan above 60%, amber above 30%, red below, and four tick marks
  make it read as a scale rather than a mood.
- Burnt rounds get no meter at all: nothing was measured, so there is nothing to
  draw.

**The grade word carries the meaning the unit cannot.** "Sharp" and "Warming up"
say what `311 ms` does not, in the player's own language.

**The stack was given room.** The number came down from `clamp(66px, 24vw,
132px)` to `clamp(52px, 14vw, 104px)`, the verdict reserves space below itself,
and the retry control moved out of the middle entirely
([ADR 15](0015-retry-follows-the-hand-sideways.md)).

## Consequences

- Three ways to read the same round — bar, word, number — so it lands whether or
  not the player knows what a millisecond is.
- Comparing two rounds is now a glance at two bar lengths instead of arithmetic.
- The ramps are judgement calls with real consequences: too generous and every
  round looks great, too harsh and nobody sees a full bar. They are constants in
  `scoring.ts` with tests pinning both ends, so moving them is a deliberate act.
- `role="meter"` with `aria-valuenow` means assistive technology gets the same
  reading.

## Alternatives considered

**A ring filling around the number.** Prettier, and much harder to compare two
of them from memory. Length beats angle for magnitude.

**Five discrete pips by grade.** Legible, but throws away the resolution that
makes a 4ms improvement visible.

**Percentile against other players.** Needs a backend and other players, both
explicitly out of scope ([ADR 9](0009-no-backend-local-records.md)).

**Spelling out "milliseconds".** Fixes the jargon and not the real problem,
which is that the number needs a frame of reference, not a longer name.
