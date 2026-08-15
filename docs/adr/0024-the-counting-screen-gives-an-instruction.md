# 24. The counting screen gives an instruction, not a status

- Status: Accepted
- Date: 2026-08-15
- Amends: [ADR 13](0013-say-wait-out-loud.md), [ADR 20](0020-the-interval-is-a-number-again.md)

## Context

Once the flash had fired in the counting modes, the screen went almost entirely
dark and left a single dim line: `liczysz 6s` — "counting 6s". The intent was
purity. [ADR 13](0013-say-wait-out-loud.md) established that nothing may move
during the count, because a moving pixel is a clock the player could read
instead of keeping their own, and the smallest possible screen honoured that
most obviously.

The consequence, reported from play: a near-empty dark screen does not read as
_count now_. It reads as _the game has stopped working_. And `liczysz 6s` is a
status — it describes what is happening — where a player who has never seen this
mode before needs an instruction telling them what to do about it.

There was a second problem underneath. The waiting screen and the counting
screen were distinguished mainly by absence: one had things on it, the other had
almost nothing. Absence is a weak signal, and it is indistinguishable from a
fault.

## Decision

**The counting screen says `Kliknij za` / `Tap in` above the interval, and the
interval is the largest thing on it.**

The two screens are now told apart by four things at once, none of which move:

|            | Waiting for the flash                  | Counting it out                       |
| ---------- | -------------------------------------- | ------------------------------------- |
| Motion     | rotating arc                           | **none whatsoever**                   |
| Headline   | `Czekaj`, cyan                         | `Kliknij za`, grey                    |
| Hero       | the arc                                | the number                            |
| The number | cyan, `clamp(44px, 13vmin, 76px)`      | **ink, `clamp(60px, 17vmin, 104px)`** |
| Sentence   | "the flash starts it — then you count" | —                                     |

Cyan and smaller means _not yet_; white and large means _you are on_. That
progression carries the state change without a single animated property.

The stillness rule is unchanged and now enforced rather than asserted: a
browser check reads `document.getAnimations()` during the counting phase and
requires zero running animations. The instruction's own fade-in is delayed
until the waiting group has finished leaving, so the two never overlap, and
after that the screen is inert until the press.

## Consequences

- A first-time player is told what to do at the moment they need to know.
- The difference between the two screens is now positive — different things
  present — rather than one being the absence of the other.
- `countingNow` is gone from the dictionary; `countPrompt` replaces it, and a
  test asserts it differs from the waiting headline in both languages.
- `Kliknij za 6s` is out by the length of the flash pulse, since the reference
  is the flash rather than the moment the words appear. That is ~120ms against
  an interval of 2–10s, and the phrasing is the one the player asked for.

## Alternatives considered

**A progress ring or a countdown.** Solves legibility and destroys the mode:
the whole point is that the player keeps the time, not the screen.

**Leaving it dark and explaining on the home screen.** Puts the instruction
several seconds and one screen away from the moment it is needed.

**A static ring around the number, echoing the waiting arc.** More pixels for
the same information, and it invites the reader to look for it filling.
