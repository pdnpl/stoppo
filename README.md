# Stoppo

**Stop the clock.** A browser game about the two opposite halves of timing: how
fast you can react to a light, and how well you can hold a second in your head
with nothing on screen to help you.

No accounts, no leaderboard, no backend. Under 6 kB of JavaScript, served
straight from Cloudflare's edge.

## The three modes

Plays in **English and Polish**, picked from your browser and switchable in the
corner of the home screen.

| Mode       | What happens                                                                         | What it scores            |
| ---------- | ------------------------------------------------------------------------------------ | ------------------------- |
| **Reflex** | Dark for 1–5s, then a disc of light lands in the centre. Press.                      | Reaction time, ms         |
| **Count**  | You are told an interval (2–10s, random). The flash starts it. Count it in the dark. | Overshoot, ms             |
| **Lock**   | The same, on an interval you choose and keep, so you can train one number.           | Overshoot, ms, per target |

Two rules hold the whole thing together:

- **Randomise the stimulus, never the contract.** The mode is a promise you made
  before the round started. What the game randomises is the dark wait, and the
  target in Count — things you cannot rehearse.
- **Early is burnt.** In the counting modes a press before the target scores
  nothing at all. Aiming short is the safe-feeling move, so the game refuses to
  reward it. See [ADR 7](docs/adr/0007-early-press-burns-the-round.md).

## How the timing actually works

The naive implementation measures from the moment JavaScript _decided_ to show a
flash. Nobody reacts to a decision — they react to photons, which arrive one
frame later. Bake that in and the same player scores differently at 60Hz and
120Hz.

So:

1. The flash is written to the DOM **inside** a `requestAnimationFrame`
   callback, riding the frame the engine is already in.
2. The **next** frame callback is the vsync presenting that frame. Its timestamp
   is the zero point.
3. The press is read from `event.timeStamp`, captured when the input happened
   rather than when our handler got a turn.

```
frame N    t0   delay elapsed → paint the flash (rides this frame)
frame N+1  t1   this vsync presents it       →  flashAt = t1
press           event.timeStamp − flashAt    →  your score
```

Because `t1` is read from the display rather than assumed, the game
self-calibrates to any refresh rate with no hard-coded frame duration.
`tests/engine.test.ts` proves it against a hand-cranked fake display.

**What is not measured:** the gap between the compositor handing over a frame
and the panel actually lighting up. That is invisible to the web platform on
every browser. It is a roughly constant offset per device, so comparing your own
scores over time is sound; comparing across devices carries that unknown.

Details in [ADR 4](docs/adr/0004-measure-from-presented-vsync.md) and
[ADR 5](docs/adr/0005-trust-input-event-timestamps.md).

## Running it

```bash
npm install
npm run dev
```

| Command             | Does                                         |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Vite dev server                              |
| `npm test`          | Vitest, once                                 |
| `npm run lint`      | ESLint, type-aware                           |
| `npm run typecheck` | `tsc --noEmit`                               |
| `npm run build`     | Typecheck then production build into `dist/` |
| `npm run deploy`    | Publish to Cloudflare Workers                |

## Deploying

The game ships as an **assets-only Cloudflare Worker** — `wrangler.jsonc`
declares an `assets` directory and deliberately declares no `main`, so requests
are served from the edge without invoking any Worker code
([ADR 3](docs/adr/0003-assets-only-cloudflare-worker.md)).

Locally:

```bash
npm run deploy
```

From CI, the `Deploy` workflow publishes on every push to `main` once two
repository secrets exist:

- `CLOUDFLARE_API_TOKEN` — a token with the **Edit Cloudflare Workers** template
- `CLOUDFLARE_ACCOUNT_ID`

Until they are set the workflow reports a skip rather than failing.

## Layout

```
src/
  game/        pure logic — no DOM, fully unit tested
    machine.ts   the state machine every round runs through
    plan.ts      what a round is: mode, dark wait, target
    rng.ts       crypto-backed randomness for the wait and the target
    scoring.ts   grades, formatting, what counts as a score
    records.ts   personal bests, defensively read and written
  engine/      the browser half
    engine.ts    the frame loop, and where the flash timestamp comes from
    input.ts     turning an event into a trustworthy timestamp
  i18n/
    copy.ts      every word the game says, in English and Polish
  ui/
    verdict.ts   outcome → what the result screen says
  main.ts      wiring, DOM, screens
  styles.css   Neon Void
tests/         Vitest, no browser required
docs/adr/      why any of this is the way it is
```

## Accessibility and photosensitivity

The game plays **bright flashes on a dark background**. That is the mechanic and
it cannot be turned off, so the home screen says so before you press anything.
Sit it out if that is a problem for you.

The flash is a central disc over a faint wash rather than a whole white screen —
about an eighth of the light, and no harder to see, because it lands where you
are already looking ([ADR 12](docs/adr/0012-flash-a-disc-not-the-screen.md)).

Everything else is covered: the game is fully playable from the keyboard with
the space bar, results are announced to a live region, focus is visible, and
`prefers-reduced-motion` collapses every decorative animation.

## Decisions

Everything worth arguing about is written down in
[`docs/adr/`](docs/adr/README.md) — the stack, the timing method, the mode
design and what was rejected on the way.

## Licence

MIT.
