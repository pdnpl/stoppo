# 17. The mode card is the start button

- Status: Accepted
- Date: 2026-08-15

## Context

The home screen asked for two decisions in a row: pick one of three modes, then
press Play. A playtester put it plainly — the first three buttons choose a mode
and then you still have to press START.

That is one step more than the game needs. The mode picker exists because the
mode is a contract ([ADR 6](0006-three-player-chosen-modes.md)), but a contract
does not need a separate confirmation. Worse, the Play button carried the hint
"or press space", which is nonsense on a phone, where the game will spend most
of its life.

## Decision

**Tapping a mode starts that mode.** There is no Play button.

Lock is the one exception, because it has a number to settle first: tapping it
opens the seconds, and each second is itself a start button. So Lock is still
one decision, just a two-part one — and the chip a player reaches for is the
thing that begins the round.

Each card carries one glowing circular affordance on the right: a play triangle
on Reflex and Count, a chevron on Lock. That is the only lit element on the
card, so what to press is unambiguous without three competing primary buttons.

The card for the mode played last keeps a cyan border, because that is what the
space bar starts. The space hint moved to the footer and appears only behind
`@media (pointer: fine)` — said where there is a keyboard to say it about, and
silent everywhere else.

## Consequences

- One tap from opening the game to a live round, two for Lock.
- Nothing on the home screen is a dead end: every control either starts a round
  or reveals controls that do.
- The mode is still stored, so the space bar and the next visit both know where
  to go.
- Cost: a player who wants to read their records before committing now has a
  live round starting under their finger. Mitigated by the round opening with a
  1–5s dark wait — there is time to change your mind, and Modes is one press
  away the moment it settles.

## Alternatives considered

**Keep Play, make it louder.** Fixes the hierarchy complaint and not the extra
step.

**First tap selects, second tap on the same card starts.** No extra button and
no extra step, but the rule is invisible: nothing on screen says a second press
does something different from the first.

**Start on tap, with a one-second countdown to cancel.** Adds a delay to every
single round to protect against a mistake that costs one press.
