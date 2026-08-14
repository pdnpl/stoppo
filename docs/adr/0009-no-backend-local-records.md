# 9. No backend; records live in localStorage

- Status: Accepted
- Date: 2026-08-14

## Context

Reaction games attract leaderboards, and leaderboards attract accounts, and
accounts attract a backend. The brief ruled all three out. What remains is the
question of whether the game keeps anything at all between visits.

A reflex game with no memory is a toy. The number only means something next to
the last one.

## Decision

No server, no API, no accounts. Personal bests and the last chosen mode live in
`localStorage` under `stoppo:records:v1` and `stoppo:prefs:v1`.

Storage is treated as advisory throughout. `browserStorage()` returns `null`
when access throws, every read is sanitised against a hostile or corrupt
payload, and every write is wrapped — a full or blocked store costs the player
their history, never their round.

Records are kept per mode, and in Lock per interval, because a 2s target and a
9s target are not the same achievement.

## Consequences

- Nothing leaves the device, so there is no privacy surface, no cookie banner
  and nothing to disclose.
- The game works offline once loaded, and in private browsing, and with storage
  disabled — just with less memory.
- No cross-device history. Someone who plays on a phone and a laptop has two
  sets of records, and that is the honest consequence of having no accounts.
- Versioned keys mean a future schema change can migrate or discard cleanly
  rather than crashing on a shape it did not expect.

## Alternatives considered

**A leaderboard on Workers KV or D1.** Explicitly out of scope, and it would
drag in abuse handling for a score that is trivial to forge from the console.

**No persistence at all.** Simplest, and it removes the only reason to come back
tomorrow.

**A service worker for offline play.** Tempting for a game this small, but it
adds cache-invalidation failure modes to something that currently cannot break
after deploy. Worth revisiting if the game grows assets.
