# 20. The interval is a number again, under an unambiguous wait

- Status: Accepted
- Date: 2026-08-15
- Amends: [ADR 13](0013-say-wait-out-loud.md)

## Context

[ADR 13](0013-say-wait-out-loud.md) demoted the interval from a hero number to
a phrase inside a sentence — _"the flash starts it — then you count 6s"_ —
because as a hero number it had been misread as a countdown already running.

That fixed the misreading and created a new one. The number a player has to
carry through the next several seconds was now 12.5px of body text among other
body text, and the report was simply that it could not be seen.

Both readings are correct about their own moment. ADR 13 was right that a lone
big number reads as _live_. It was wrong to conclude the number had to be small
— what made it read as live was the absence of anything saying otherwise.

## Decision

The interval goes back to being the largest thing in the waiting state,
`clamp(44px, 13vmin, 76px)`, but it now arrives **third**, after two elements
that have already settled the question:

```
        (rotating arc)          busy
           WAIT                 not yet
  the flash starts it —
     then you count
            6s                  ← the number, large
```

The sentence ends where the number begins, so word order does the work: the
flash comes first in the reading, the counting second, and the number is the
object of a verb that has not happened yet.

The dim reminder during the count grew too, from 13px to
`clamp(20px, 5.5vmin, 30px)`. It is still motionless, because a moving pixel
there would be a clock to read instead of the player's own.

## Consequences

- The number is legible at arm's length on a phone, which is the whole point of
  having it on screen.
- The waiting state now has a clear reading order — busy, wait, instruction,
  number — rather than one dominant element.
- Splitting the sentence from the number means the copy for
  `waitBeforeCount` must end where the number starts. Both locales are written
  that way and a test asserts `seconds()` still carries its value.
- The risk ADR 13 identified is real and now rests entirely on the spinner and
  the word "wait" doing their job. If the misreading comes back, the answer is
  a louder wait, not a smaller number.

## Alternatives considered

**Keep it in the sentence, just bolder.** Bold body text inside body text is
still body text at a glance.

**Show the number only after the flash.** Removes the preparation time — you
would learn what to count as the counting began.

**Announce the interval aloud.** Would work, and needs an audio permission
prompt and a speech engine for one number.
