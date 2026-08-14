# Working on Stoppo

## Language

Conversation with the repository owner is in **Polish**. Everything that lands
in the repository — code, comments, commit messages, documentation, ADRs and
the game's own interface — is in **English**.

## What this is

A browser game measuring two opposite faculties: raw reaction to a flash
(Reflex) and holding an interval in your head with nothing on screen to help
(Count, Lock). No backend, no accounts, no leaderboard. Assets-only Cloudflare
Worker.

## Things that are load-bearing

Break any of these and the number on screen stops meaning what it claims.
Each has an ADR; read it before changing the behaviour rather than after.

1. **The zero point is the vsync that presented the flash**, never the moment we
   asked for it. The flash is painted inside a `requestAnimationFrame` callback
   so it rides the frame in flight; the _next_ frame callback's timestamp is
   `flashAt`. No frame duration is ever hard-coded.
   ([ADR 4](docs/adr/0004-measure-from-presented-vsync.md))
2. **The flash reaches full brightness on its first frame.** `.flash.is-on`
   carries `transition: none` deliberately. A transition on the way in ramps
   luminance over ~100ms and turns the score into fiction.
   ([ADR 8](docs/adr/0008-neon-void-and-a-flat-flash.md))
3. **Presses are read from `event.timeStamp`**, not from a clock inside the
   handler. ([ADR 5](docs/adr/0005-trust-input-event-timestamps.md))
4. **Only `transform` and `opacity` are animated**, so the compositor owns
   motion and the main thread stays free to notice a finger landing.
5. **Randomise the stimulus, never the contract.** The mode, and the interval in
   Lock, are the player's choice and stay put. The dark wait and the Count
   target are what get rolled.
   ([ADR 6](docs/adr/0006-three-player-chosen-modes.md))
6. **An early press in a counting mode burns the round.** Not "scores badly" —
   burnt, recording nothing, so impatience is never the safe play.
   ([ADR 7](docs/adr/0007-early-press-burns-the-round.md))

## Shape of the code

`src/game/` is pure: a reducer, a round planner, scoring, records. No DOM
anywhere near it, which is why it is fully unit tested.
`src/engine/` is the browser half — the frame loop and input timestamps.
`src/main.ts` wires them to the DOM. That separation is the reason the timing
rules can be proved in plain Node; keep logic out of `main.ts`.

## Flow

`main` is protected: pull requests only, `check` must pass, zero approvals
required (single-account organisation), squash merges.

```bash
npm run format && npm run lint && npm run typecheck && npm test && npm run build
```

Add an ADR when a change settles something a future reader would re-open.
Records are immutable — supersede, never edit.

## Verifying visuals

The browser preview pane does not work in this environment: screenshots fail
and `requestAnimationFrame` never fires, so anything timing-related is
unverifiable there. Prove behaviour with `tests/engine.test.ts` against the
hand-cranked fake display instead, and ask the owner to eyeball the rest.
