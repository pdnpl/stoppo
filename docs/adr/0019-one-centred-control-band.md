# 19. One centred control band along the bottom of the stage

- Status: Accepted
- Date: 2026-08-15
- Amends: [ADR 15](0015-retry-follows-the-hand-sideways.md), [ADR 10](0010-retry-under-the-finger.md)

## Context

Two complaints arrived together and turned out to be the same complaint.

The retry pill tracked the hand's horizontal position
([ADR 15](0015-retry-follows-the-hand-sideways.md)). A player looking at a
screenshot of it read that as a bug: _the button is sometimes not centred._ They
were not wrong to. A control that lands somewhere different every round has no
resting place, and the hint line beneath it is wider than the pill, so near the
edge it ran off the screen.

Meanwhile the way back to the modes sat in the top-left corner in
`--muted-deep`, which the same player described as completely invisible. It was
one shade above the background, tiny, and nowhere near where the hand or the eye
had been for the last thirty seconds.

The thread connecting them: the _whole stage_ already retries on any press. The
pill was never the mechanism, only the sign — and a sign that moves is a worse
sign, while a sign nobody can see is not a sign at all.

## Decision

Everything the player can press after a round lives in one centred column at the
bottom of the stage:

```
        [  JESZCZE RAZ  ]      pill, centred
    albo dotknij ekranu gdziekolwiek
          [  Tryby  ]          bordered, --muted
```

The pill no longer tracks the pointer. Modes moved out of the corner into the
same band, with a border and `--muted` text so it reads as a control rather than
as dust. The verdict reserves space above the band, so the two never meet at any
viewport.

What survives unchanged from ADR 10: any press anywhere retries, the controls
are real `<button>`s, Modes stops its press from bubbling into a retry and is
disabled outright while a round is live, and presses within 90ms of settling are
swallowed.

## Consequences

- Both controls have a fixed home, so the second round onwards costs no
  searching — and neither does the tenth.
- The hint can no longer overflow, because the column is centred and its widest
  line sets the width.
- The thumb-reach argument from ADR 15 is weaker but not lost: the band is at
  the bottom edge, which is the reachable part of a phone.
- Verified in a browser that the retry centre and the viewport centre are the
  same pixel, that Modes renders in `--muted` with a visible border, and that
  the tallest verdict clears the band.

## Alternatives considered

**Keep the tracking and fix only the overflow.** Addresses the symptom and
leaves the thing that actually read as broken.

**Modes in the corner, just brighter.** Would have fixed the visibility and left
it far from both the hand and the eye, which are at the bottom of the screen by
the time a round ends.

**Modes inside the retry pill as a second action.** Fewer elements, and one of
them would be a press away from the wrong outcome — retry is pressed constantly,
leaving is pressed once.
