# 13. Say "wait" out loud, and never show a clock while counting

- Status: Accepted
- Date: 2026-08-15

## Context

The waiting state showed a slowly breathing ring, the words "Wait for the
light", and — in the counting modes — the target interval as the largest thing
on screen.

A playtester read that screen as _the round has started, begin counting_, and
pressed. The layout was at fault, not the reader: a big number is a hero
element, and a ring that breathes reads as something in progress rather than
something not yet begun. The copy said wait; everything around it said go.

## Decision

Three changes, all pulling the same way.

**The waiting state looks busy, not ready.** A rotating arc — the universal
"working on it" gesture — replaces the breathing ring. Rotation is a wait
signal in a way that pulsing is not.

**The instruction is sequenced, not just stated.** The headline is "Wait", and
beneath it a sentence that puts the flash _before_ the counting in the order the
words arrive: _"the flash starts it — then you count 6s"_. The interval is no
longer a hero number floating on its own, waiting to be misread as a countdown
already running.

**Counting looks like counting.** Once the flash has fired, the waiting group
fades out entirely and a single dim line remains: _"counting 6s"_. It never
moves, because a moving pixel during the count is a clock the player could read
instead of keeping their own.

## Consequences

- The three states of a counting round now look different from each other:
  busy, flash, still.
- The rotating arc is `transform`-only and stops entirely once counting starts,
  so nothing animates during the interval being measured.
- Costs a line of copy on screen during the wait. Worth it — the failure it
  prevents costs a whole round.

## Alternatives considered

**A countdown before the round.** "3, 2, 1, go" removes all ambiguity and also
removes the random wait, which is the thing that stops a player anticipating the
flash.

**Only changing the words.** Tried first in effect, and the report showed why it
is not enough: the layout was shouting louder than the copy.

**Keeping the interval large during the wait.** It is the number the player must
hold, so the instinct is to make it prominent. But prominence is exactly what
made it read as live.
