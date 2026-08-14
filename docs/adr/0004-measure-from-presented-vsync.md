# 4. Measure reaction from the vsync that presented the flash

- Status: Accepted
- Date: 2026-08-14

## Context

A reaction game is only worth playing if the number it prints is defensible, and
the naive implementation is wrong in a way that flatters nobody consistently.

`setTimeout(showFlash, delay)` then `Date.now()` measures from the moment
JavaScript decided to show a flash. The player cannot react to a decision. They
react to photons, and those arrive at the next vertical sync after the mutation
is committed — one frame later, which is 16.7ms at 60Hz and 8.3ms at 120Hz. Bake
that in and the same player scores differently on two monitors, which is exactly
the unfairness we are trying to avoid.

## Decision

The flash is written to the DOM **inside** a `requestAnimationFrame` callback,
so the mutation rides the frame the engine is already in. The engine then treats
**the next frame callback's timestamp** as the moment the flash reached the
glass, and every score is measured from that number.

```
frame N   : timestamp t0 — delay elapsed, add the class (rides this frame)
frame N+1 : timestamp t1 — this vsync is presenting frame N.  flashAt = t1
press     : event.timeStamp - flashAt
```

Because `t1` is read from the display rather than assumed, the game
self-calibrates to 60Hz, 120Hz, 144Hz or anything else without a single
hard-coded frame duration.

## Consequences

- The same player gets the same number on a 60Hz laptop and a 120Hz phone, minus
  genuine hardware differences.
- The engine is testable without a browser: `tests/engine.test.ts` drives a
  hand-cranked fake display and asserts that `flashAt` is the _later_ timestamp.
- What is still not measured, and cannot be from JavaScript, is the latency
  between the compositor handing over a frame and the panel lighting up. That is
  a constant offset per device, it is invisible to the web platform, and the
  README says so rather than pretending otherwise.
- An `armed` state carries a deliberate extra phase, `flashPending`, covering the
  gap between "painted" and "presented". A press in that window is a false start,
  because the screen was still dark when the player committed.

## Alternatives considered

**`performance.now()` at mutation time.** One frame of systematic flattery, and
it varies with refresh rate. Rejected.

**Estimating the frame interval and adding it.** Better than nothing, but it is
an estimate where a measurement is available for free.

**`requestPostAnimationFrame`.** Would be the precise tool for this, and it is
still not in any shipping browser.
