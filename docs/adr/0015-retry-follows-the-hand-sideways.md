# 15. The retry control follows the hand sideways only

- Status: Accepted
- Date: 2026-08-15
- Amends: [ADR 10](0010-retry-under-the-finger.md)

## Context

ADR 10 put a circular _Again_ target at the exact coordinates of the press that
ended the round, so the finger never had to travel. The reasoning still holds
and the consequence was not foreseen: a press near the middle of the screen puts
the button on top of the verdict, and the result screen becomes a pile of
overlapping text. A playtest screenshot showed the grade, the score, the retry
label and its hint all stacked on the same pixels.

The deeper point is that the button was never the mechanism. The whole stage
retries on any press, so the target under the finger is already the entire
screen. The button is an affordance — it tells you the option exists — and an
affordance that obscures the result is paying for itself with the wrong money.

## Decision

The retry control keeps the hand's **horizontal** position and takes a fixed
**vertical** one, in the thumb band near the bottom edge. It is a pill rather
than a circle, so a two-word label fits without wrapping, and its hint moved
outside it as a separate line.

The verdict owns the vertical centre and reserves space beneath itself, so the
two can never meet. Everything else from ADR 10 stands: any press anywhere
retries, the control is a real `<button>`, and presses within 90ms of settling
are swallowed.

## Consequences

- Which side of the screen your hand is on still decides where the button is,
  which is the part of "under the finger" that actually mattered on a phone.
- The result is legible at every viewport, verified by asserting in a real
  browser that the verdict's box and the retry's box do not intersect, using the
  tallest verdict the game can produce.
- A pill in the thumb band is also simply a better touch target than a circle
  wherever the last tap happened to land.
- Cost: on desktop, a click at the top of the screen sends the button to the
  bottom. Predictable, and the pointer is not a thumb.

## Alternatives considered

**Keeping the exact tap position and shrinking the verdict.** Trades legibility
of the score for a few pixels of finger travel. The score is the reason the
screen exists.

**Pushing the verdict away from the button.** Content that dodges a control is
worse than a control that stays put — the number would move between rounds and
be harder to compare.

**Dropping the button entirely.** Tap-anywhere already works, but a first-time
player and a screen reader both need to be told that.
