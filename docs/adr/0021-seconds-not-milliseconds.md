# 21. Say seconds, not milliseconds

- Status: Accepted
- Date: 2026-08-15

## Context

Every measured value on screen was printed in milliseconds: `214 ms`, `28 ms off
your best of 186 ms`, `Too early by 200 milliseconds`. That is the unit the code
works in and the unit the timing literature uses, and it is also jargon. The
report was simply that hardly anyone knows what `ms` means — and a game aimed at
adults _and_ children cannot lead its result screen with a unit half the players
have to guess at.

Seconds carry exactly the same information. `0.214` and `214 ms` are the same
measurement; one of them needs no explanation.

## Decision

**Every measured value is printed in seconds to three decimal places.** One
formatter, `formatSeconds`, and everything a player can read goes through it:
the number inside the disc, the unit line, the record comparison, the personal
bests on the home screen, and the sentences read out to assistive technology.

Three decimals rather than two, because the game measures to the millisecond and
a reaction game where `0.21` and `0.21` are different rounds would be absurd.

**The separator is localised.** English writes `0.214`, Polish writes `0,214`.
`formatSeconds` takes the separator from the copy, so it is a translation
decision rather than a hard-coded assumption.

**The chosen interval keeps its whole number.** The Lock picker offers `4s`,
not `4,000s` — that value is a choice the player made, not a measurement, and
three decimals on it would be noise. The `cel 3,000s · Ty 3,142s` line keeps
three decimals on both sides, because the two are being compared.

**The symbol sits tight against its number** — `0,214s`, not `0,214 s`. SI and
Polish typography both call for the space; the repository owner asked for it
closed up, it is common in interfaces, and it reads cleanly at the sizes this
game prints. A test pins it, matching a digit followed by whitespace and a lone
`s`, which leaves the spelled-out `seconds` and `sekundy` alone.

Internally nothing changes: the state machine, the scores and the stored records
are all still milliseconds. This is a presentation decision and lives at the
presentation edge.

## Consequences

- The longest string the game can print went from four characters (`1500`) to
  five (`9,999`), which no longer fitted the smallest disc the ring clamp
  allows. The dial numeral dropped from `0.17` to `0.145` of the dial size, and
  a test pins the five-character ceiling so the next change cannot quietly
  break it.
- Stored records need no migration — they were always milliseconds and still
  are.
- Two tests assert that no user-visible string in either language contains the
  token `ms`, so the abbreviation cannot creep back in through a new sentence.
- Cost: `0.214` is five glyphs where `214` was three, so the result screen is
  slightly less punchy. Legibility beat punch.

## Alternatives considered

**Spell out "milliseconds" in full.** Longer, and still asks the reader to know
what a thousandth of a second is.

**Two decimals.** Rounder, and throws away the millisecond the whole engine
exists to measure.

**Seconds with a unit suffix on the big number itself** (`0.214 s` inside the
disc). The disc is small at its lower clamp, and the unit already has its own
line directly underneath.

**A hard-coded full stop in both languages.** Simpler, and wrong in Polish,
where the decimal comma is not a preference.
