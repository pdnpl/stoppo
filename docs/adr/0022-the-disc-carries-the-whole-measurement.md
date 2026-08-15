# 22. The disc carries the whole measurement

- Status: Accepted
- Date: 2026-08-15
- Amends: [ADR 21](0021-seconds-not-milliseconds.md)

## Context

The result screen printed the number inside the disc and captioned it from
below with the unit spelled out: `sekundy`, or in the counting modes `sekundy po
czasie` — "seconds late".

That caption was doing two jobs badly. As a unit it was redundant beside a
record line that already reads `o 0,028s gorzej od rekordu 0,186s`. And "seconds
late" reads as an accusation: it names the player's correct, successful round as
a lateness, when overshoot _is_ the score in those modes and pressing after the
target is exactly what the rules ask for. The burnt-round wording exists for
actual mistakes ([ADR 7](0007-early-press-burns-the-round.md)); a scored round
should not borrow its tone.

## Decision

**The unit rides inside the disc, next to the number.** `0,214s`, one figure,
sized at about 43% of the numeral so it reads as a unit rather than a sixth
digit. Baseline-aligned, so it sits on the number's feet.

The caption line is gone. When a round measured nothing the number is empty and
the symbol hides with it, leaving the failure headline alone on the screen,
which is what [ADR 19](0019-one-centred-control-band.md) already wanted.

This supersedes the line in ADR 21 that argued the unit belonged on its own row
because the disc is small at its lower clamp. Measured rather than assumed: the
longest string the game can print, `9,999s`, clears the smallest disc the ring
allows by 6px.

## Consequences

- One element fewer on the result screen, and the disc is now self-contained —
  it says the whole measurement without help.
- Nothing on a successful round implies the player did anything wrong.
- `VerdictView` lost its `unit` field; the symbol is a single copy key that both
  locales happen to agree on, kept in the dictionary rather than hard-coded so a
  future locale can differ.
- The 6px headroom is thin. It is pinned by a test on the five-character value
  ceiling, and the symbol's size is expressed as a fraction of the dial, so both
  scale together.

## Alternatives considered

**Keep the caption, reword it to something neutral.** `sekundy` alone is
accurate and still redundant next to the record line.

**Put the unit in the disc at full size.** `9,999s` at the numeral's size
overflows the smallest disc — this is what forced the measurement in the first
place.

**Drop the unit entirely.** The number would be bare, and `0,214` with no unit
invites the reader to guess at the scale, which is the problem
[ADR 21](0021-seconds-not-milliseconds.md) set out to solve.
