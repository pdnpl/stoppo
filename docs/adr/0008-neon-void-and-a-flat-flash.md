# 8. Neon Void, and a deliberately flat flash

- Status: Accepted
- Date: 2026-08-14

## Context

Four visual directions were mocked up and compared side by side: Neon Void (near
-black with a single cyan glow), Clinical Instrument (measuring-device grid and
monospace), Warm Minimal (warm black, amber, serif) and Kinetic Gradient
(breathing gradient behind glass).

The choice is not only taste. The dark state is the background against which the
signal has to register, and the signal registering fast is the mechanic.

## Decision

**Neon Void.** Background `#04050b`, one cyan accent (`#22d3ee`), a breathing
ring while armed, and a single ambient radial glow.

The flash itself is **flat `#fff`** with no gradient, no vignette and no
texture, sitting on its own compositor layer with `will-change: opacity`.

Turning it on is `opacity: 0 → 1` with `transition: none` on the way in — a
transition here would ramp the brightness over a hundred milliseconds and turn
the measurement into fiction. Fading back out keeps a short transition, because
that happens after the moment being measured.

Everything that moves animates `transform` or `opacity` only, so the compositor
owns it and the main thread stays free to notice a finger landing.

## Consequences

- Maximum luminance contrast between the dark state and the signal, which is
  exactly the axis the game is played on.
- A solid-colour layer needs no rasterisation, so switching it on costs a
  compositor commit and nothing else. This is why the tempting cyan bloom from
  the mockup did not survive into the flash layer.
- The palette is cheap to paint: no blurs, no filters, no large gradients
  animating.
- `prefers-reduced-motion` collapses decorative animation. It cannot collapse
  the flash — that is the game — so the home screen states plainly that the game
  plays full-screen white flashes on a dark background.

## Alternatives considered

**Clinical Instrument.** The strongest runner-up, and its measuring-scale motif
would have supported the timing story well. Its grid is more pixels to paint
behind the signal for no gain to the player.

**Kinetic Gradient.** The best-looking of the four in isolation. An animated
gradient behind the armed state is continuous compositor work at exactly the
moment the game needs the frame budget clean, and the glass blur is worse.

**Warm Minimal.** Lovely for the waiting state, weakest at the moment of impact,
which is the frame the whole game is built around.
