# 12. Flash a disc, not the whole screen

- Status: Accepted
- Date: 2026-08-15
- Amends: [ADR 8](0008-neon-void-and-a-flat-flash.md)

## Context

ADR 8 chose a flat, full-screen `#fff` flash for maximum contrast against the
near-black waiting state, and reasoned about it purely as a compositing
decision. Playtesting found the part that reasoning missed: after a minute of
staring into `#04050b`, a whole screen of pure white is genuinely painful,
worst of all in Reflex where the flash stays lit until the press.

Pain is not a neutral cost in a game about staying relaxed and alert. A player
who is flinching in anticipation of glare is not measuring their reaction to
light, they are measuring their reaction to being hurt.

## Decision

The flash is a large central disc — `clamp(190px, 54vmin, 430px)` of `#eaf7ff`
— over a gentle radial wash that lifts the rest of the screen a few percent.
Measured on a 1280×720 viewport, the lit disc covers about **13% of the screen**
where the old flash covered 100%.

Everything ADR 8 said about _how_ it switches on still stands and is unchanged:
own compositor layer, `will-change: opacity`, and `transition: none` on the way
in so full brightness lands on the very first frame.

Because the flash no longer covers the screen, the waiting group has to get out
of the way, and it does so by fading — `opacity`, never `display` — so the frame
that paints the flash is never asked to run layout.

## Consequences

- Roughly an eighth of the light, for a signal that is if anything easier to
  catch: it appears exactly where the player is already looking, since the
  waiting indicator sits dead centre.
- Peripheral vision still registers the event through the wash, so nothing is
  lost for a player whose gaze has drifted.
- One more element to keep off the critical frame. The rule is now written into
  the stylesheet header: nothing that changes when the flash is painted may
  trigger layout.
- Cost: a disc is a rounded raster rather than a solid-colour fill, so the layer
  is marginally more expensive to prepare. It is prepared once, at load, and
  never re-rasterised.

## Alternatives considered

**Dimming the full-screen white.** Simplest change, but a dim full screen is
still a screen-sized light source, and lowering the contrast erodes the signal
everywhere rather than concentrating it where it is useful.

**A brightness setting.** Puts the calibration on the player and needs a
settings screen the game does not otherwise want. Reconsider if one default
turns out not to fit.

**Fading the flash in.** Would solve the glare completely and destroy the
measurement, which is the one thing this game is for.
