# 2. Vanilla TypeScript on Vite, no UI framework

- Status: Accepted
- Date: 2026-08-14

## Context

The whole game is one full-screen surface with fewer than ten visual states and
a single number on screen at a time. Against that, the thing we are actually
selling is latency honesty: the main thread must be free at the moment a frame
is due and at the moment a finger lands.

React, Vue or Svelte would each carry a scheduler that sits between our state
change and the DOM. React in particular batches and may defer work across
frames, which is exactly the wrong property for code whose job is to mutate one
class name inside a specific `requestAnimationFrame` callback.

## Decision

Vanilla TypeScript, bundled by Vite. State lives in a pure reducer
(`src/game/machine.ts`); the shell in `src/main.ts` applies effects to the DOM
directly. Vitest covers the reducer, the engine and the scoring; there is no
component layer to test.

## Consequences

- Production bundle is roughly 4 kB of JavaScript gzipped, so the game is
  interactive before a framework would have finished parsing.
- Nothing stands between "set the class" and the compositor.
- The reducer is testable in plain Node with no DOM, which is why the timing
  rules have real coverage.
- Cost: no component ergonomics. If the UI ever grows past a handful of screens
  this decision should be revisited rather than worked around.

## Alternatives considered

**React.** Best-known ergonomics, wrong scheduler for the one thing that matters
here, and roughly ten times the runtime cost for a screen with one number on it.

**Svelte.** Compiles away most of the runtime and would have been defensible.
Rejected because it still owns the update timing, and it buys ergonomics we do
not need at this size.

**Canvas rendering.** Full control over painting, but it throws away accessible
text, focus handling and CSS compositing for no measurable gain — a solid-colour
DOM layer is already the cheapest thing a compositor can draw.
