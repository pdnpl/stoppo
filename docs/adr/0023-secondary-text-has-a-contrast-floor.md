# 23. Secondary text has a contrast floor

- Status: Accepted
- Date: 2026-08-15

## Context

Neon Void is built on near-black, and the temptation on a near-black background
is to make everything except the hero element very dark grey. That is what
happened: `--muted-deep` was `#4b5563`, which measures **2.69:1** against the
`#04050b` background. WCAG asks for 4.5:1 on body text and 3:1 on large text, so
it was under any floor worth naming.

Measuring it understates the problem, too. The background is not uniform — an
ambient cyan glow lifts the middle of the screen — so text that is marginal on
paper disappears entirely where the glow sits. The report was exactly that:
lines like `cel 7,000s · Ty 7,177s` were melting into the turquoise.

## Decision

**Muted text is muted by being cooler and lighter than the ink, not by being
closer to the background.** The two tokens moved to:

| Token          | Was       | Now       | Contrast on `#04050b` |
| -------------- | --------- | --------- | --------------------- |
| `--muted`      | `#7c8794` | `#d5dfea` | 15.1:1                |
| `--muted-deep` | `#4b5563` | `#9fadbc` | 8.9:1                 |

Anything a player is expected to _read_ — the target comparison, the personal
bests, the retry hint, the fine print — sits at `--muted` or brighter. Modes,
which is a control rather than a caption, went to full `--ink` with a stronger
border.

The floor is **4.5:1 measured against `#04050b`**, and the palette now clears it
by a wide margin on purpose, because the glow eats some of it back.

## Consequences

- Every line on the result screen is legible at arm's length on a phone, which
  is where this game is played.
- The visual hierarchy still works: the gap between `--ink` and `--muted` is
  smaller than it was, so hierarchy now comes from size, weight and letter
  spacing rather than from hiding text.
- Cost: the screen is busier than a very dim palette looks in a screenshot. A
  screenshot is not the product.
- The background is untouched. The complaint was never about the background.

## Alternatives considered

**Brighten only the lines that were reported.** Fixes today's screenshot and
leaves the same trap set everywhere else.

**Add a scrim behind text over the glow.** More pixels to paint on a screen
whose whole point is a clean frame budget, to solve a problem a hex value
solves.

**Keep the dim palette and increase font sizes.** Larger dim text is still dim,
and the sizes were already right.
