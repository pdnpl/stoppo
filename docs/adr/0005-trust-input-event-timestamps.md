# 5. Trust input event timestamps over handler time

- Status: Accepted
- Date: 2026-08-14

## Context

The other half of a reaction measurement is when the finger landed. Reading
`performance.now()` inside the handler measures when the browser got around to
running our code, which on a busy main thread can be tens of milliseconds after
the fact — and the delay is largest exactly when the machine is under load,
which is when a player is most likely to blame the game.

Trusted input events carry a `timeStamp` captured when the event was created, on
the same monotonic timeline as `performance.now()`.

## Decision

Reads go through `inputTime()` in `src/engine/input.ts`, which returns
`event.timeStamp` after sanity checks, and falls back to `performance.now()`
when the value cannot be on the performance timeline:

- non-finite or non-positive,
- ahead of the current clock, which catches the older engines that stamped
  events with epoch milliseconds.

`pointerdown` is the event we listen to — it fires before `pointerup`, `click`
and any synthesised mouse events, and it covers touch, pen and mouse in one
path. Only the primary pointer counts, so a second finger cannot score a round.

## Consequences

- Main-thread jank between the press and the handler no longer inflates scores.
- The fallback keeps the game working on anything that reports a stamp we cannot
  trust, at the cost of that one round being measured the naive way.
- Keyboard play (space) goes through the same function, so a desktop player is
  measured on the same basis, with whatever extra latency their keyboard adds.

## Alternatives considered

**`performance.now()` in the handler.** Simple, and wrong by an amount that
varies with load.

**`click`.** Fires after the press completes, adding the entire press duration.

**Pointer Events' `getCoalescedEvents()`.** Useful for drawing apps that need
sub-frame movement history; irrelevant to a single discrete press.
